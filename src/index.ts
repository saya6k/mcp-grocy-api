#!/usr/bin/env node
// Load environment variables from .env file
import 'dotenv/config';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  InitializeRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import { VERSION, PACKAGE_NAME as SERVER_NAME } from './version.js';
import { startHttpServer } from './server/http-server.js';
import { z } from 'zod';

// Debug output to help identify version and naming issues
console.error(`Starting ${SERVER_NAME} server version ${VERSION}`);

if (!process.env.GROCY_BASE_URL) {
  console.error('GROCY_BASE_URL environment variable is not set. Setting default to http://localhost:9283');
  process.env.GROCY_BASE_URL = 'http://localhost:9283';
}

// Default response size limit: 10KB (10000 bytes)
const RESPONSE_SIZE_LIMIT = process.env.REST_RESPONSE_SIZE_LIMIT 
  ? parseInt(process.env.REST_RESPONSE_SIZE_LIMIT, 10)
  : 10000;

if (isNaN(RESPONSE_SIZE_LIMIT) || RESPONSE_SIZE_LIMIT <= 0) {
  throw new Error('REST_RESPONSE_SIZE_LIMIT must be a positive number');
}
// Disabled authentication methods (but keeping references for code compatibility)
const AUTH_BASIC_USERNAME = undefined;
const AUTH_BASIC_PASSWORD = undefined;
const AUTH_BEARER = undefined;

// Hardcoded API key header name
const AUTH_APIKEY_HEADER_NAME = "GROCY-API-KEY";
const GROCY_APIKEY_VALUE = process.env.GROCY_APIKEY_VALUE;
const GROCY_ENABLE_SSL_VERIFY = process.env.GROCY_ENABLE_SSL_VERIFY !== 'false';

const hasBasicAuth = () => false; // Basic auth is disabled
const hasBearerAuth = () => false; // Bearer auth is disabled
const hasApiKeyAuth = () => !!GROCY_APIKEY_VALUE; // Only check if API key value exists

interface EndpointArgs {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
}

interface ValidationResult {
  isError: boolean;
  messages: string[];
  truncated?: {
    originalSize: number;
    returnedSize: number;
    truncationPoint: number;
    sizeLimit: number;
  };
}

// Function to sanitize headers by removing sensitive values and non-approved headers
const sanitizeHeaders = (
  headers: Record<string, any>,
  isFromOptionalParams: boolean = false
): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    
    // Always include headers from optional parameters
    if (isFromOptionalParams) {
      sanitized[key] = value;
      continue;
    }
    
    // Handle authentication headers
    if (
      lowerKey === 'authorization' ||
      (AUTH_APIKEY_HEADER_NAME && lowerKey === AUTH_APIKEY_HEADER_NAME.toLowerCase())
    ) {
      sanitized[key] = '[REDACTED]';
      continue;
    }
    
    // For headers from config/env
    const customHeaders = getCustomHeaders();
    if (key in customHeaders) {
      // Show value only for headers that are in the approved list
      const safeHeaders = new Set([
        'accept',
        'accept-language',
        'content-type',
        'user-agent',
        'cache-control',
        'if-match',
        'if-none-match',
        'if-modified-since',
        'if-unmodified-since'
      ]);
      const lowerKey = key.toLowerCase();
      sanitized[key] = safeHeaders.has(lowerKey) ? value : '[REDACTED]';
    }
  }
  
  return sanitized;
};

interface ResponseObject {
  request: {
    url: string;
    method: string;
    headers: Record<string, string | undefined>;
    body: any;
    authMethod: string;
  };
  response: {
    statusCode: number;
    statusText: string;
    timing: string;
    headers: Record<string, any>;
    body: any;
  };
  validation: ValidationResult;
}

const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

const isValidEndpointArgs = (args: any): args is EndpointArgs => {
  if (typeof args !== 'object' || args === null) return false;
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(args.method)) return false;
  if (typeof args.endpoint !== 'string') return false;
  if (args.headers !== undefined && (typeof args.headers !== 'object' || args.headers === null)) return false;
  
  // Check if endpoint contains a full URL
  const urlPattern = /^(https?:\/\/|www\.)/i;
  if (urlPattern.test(args.endpoint)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid endpoint format. Do not include full URLs. Instead of "${args.endpoint}", use just the path (e.g. "/api/users"). ` +
      `Your path will be resolved to: ${process.env.GROCY_BASE_URL}${args.endpoint.replace(/^\/+|\/+$/g, '')}. ` +
      `To test a different base URL, update the GROCY_BASE_URL environment variable.`
    );
  }
  
  return true;
};

// Collect custom headers from environment variables
const getCustomHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  const headerPrefix = /^header_/i;  // Case-insensitive match for 'header_'
  
  for (const [key, value] of Object.entries(process.env)) {
    if (headerPrefix.test(key) && value !== undefined) {
      // Extract header name after the prefix, preserving case
      const headerName = key.replace(headerPrefix, '');
      headers[headerName] = value;
    }
  }
  
  return headers;
};

class GrocyApiServer {
  private server!: Server;
  private axiosInstance!: AxiosInstance;

  constructor() {
    this.setupServer();
  }

  private async setupServer() {
    this.server = new Server(
      {
        name: SERVER_NAME,
        version: VERSION,
        serverUrl: "https://github.com/saya6k/mcp-grocy-api",
        documentationUrl: "https://github.com/saya6k/mcp-grocy-api/blob/main/README.md"
      },
      {
        capabilities: {
          tools: {}, // Empty object instead of boolean
          resources: {}, // Empty object instead of boolean
          prompts: {} // Empty object instead of boolean
        },
      }
    );

    const https = await import('https');
    this.axiosInstance = axios.create({
      baseURL: normalizeBaseUrl(process.env.GROCY_BASE_URL!),
      validateStatus: () => true, // Allow any status code
      httpsAgent: GROCY_ENABLE_SSL_VERIFY ? undefined : new https.Agent({ // Disable SSL verification only when explicitly set to false
        rejectUnauthorized: false
      })
    });

    this.setupToolHandlers();
    this.setupResourceHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    this.server.setRequestHandler(InitializeRequestSchema, async (request) => {
      console.error('[DEBUG] Initialize handler called with request:', JSON.stringify(request));
      return {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        },
        serverInfo: {
          name: SERVER_NAME,
          version: VERSION
        }
      };
    });
    
    // Custom schema for method: 'initialize' (for compatibility with clients that use this method name)
    const PlainInitializeRequestSchema = z.object({
      jsonrpc: z.literal('2.0'),
      id: z.union([z.string(), z.number()]).optional(),
      method: z.literal('initialize'),
      params: z.any().optional()
    });
    this.server.setRequestHandler(PlainInitializeRequestSchema, async (request) => {
      console.error('[DEBUG] Plain "initialize" handler called with request:', JSON.stringify(request));
      // Extract protocolVersion from request.params or fallback to a default
      let protocolVersion = '2024-11-05';
      if (request.params && typeof request.params.protocolVersion === 'string') {
        protocolVersion = request.params.protocolVersion;
      }
      return {
        protocolVersion, // Always include protocolVersion as string
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        },
        serverInfo: {
          name: SERVER_NAME,
          version: VERSION
        }
      };
    });
  }
  
  private makeApiRequest = async (endpoint: string, method: Method = 'GET', body: any = null, additionalHeaders: Record<string, string> = {}, isSpecial: boolean = false): Promise<any> => {
    // Enhanced endpoint path handling with better logging (using stderr to avoid breaking JSON responses)
    console.error(`Original endpoint: ${endpoint}, Method: ${method}, isSpecial: ${isSpecial}`);
    
    // Standardize path handling
    let normalizedEndpoint = endpoint;
    
    // Check if endpoint explicitly starts with /api/ - use it as is
    if (endpoint.startsWith('/api/')) {
      normalizedEndpoint = endpoint;
    } 
    // Handle endpoints that start with api/ without leading slash
    else if (endpoint.startsWith('api/')) {
      normalizedEndpoint = `/${endpoint}`;
    }
    // Special handling for stock operations if isSpecial is true (legacy support)
    else if (isSpecial && endpoint.includes('stock/products/')) {
      if (endpoint.startsWith('/')) {
        normalizedEndpoint = `/api${endpoint}`;
      } else {
        normalizedEndpoint = `/api/${endpoint}`;
      }
    }
    // All other endpoints - ensure they start with /api/
    else {
      if (endpoint.startsWith('/')) {
        normalizedEndpoint = `/api${endpoint}`;
      } else {
        normalizedEndpoint = `/api/${endpoint}`;
      }
    }
    
    console.error(`Final endpoint URL: ${normalizeBaseUrl(process.env.GROCY_BASE_URL!)}${normalizedEndpoint}`);

    const config: AxiosRequestConfig = {
      method,
      url: normalizedEndpoint,
      headers: {
        ...additionalHeaders,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Add timeout to prevent hanging connections
      timeout: 30000 // 30 seconds timeout
    };

    if (['POST', 'PUT'].includes(method) && body) {
      config.data = body;
      console.error(`Request body: ${JSON.stringify(body)}`);
    }

    // Only apply API Key authentication
    if (hasApiKeyAuth()) {
      config.headers = {
        ...config.headers,
        [AUTH_APIKEY_HEADER_NAME as string]: GROCY_APIKEY_VALUE
      };
    }

    try {
      console.error(`Making ${method} request to ${normalizeBaseUrl(process.env.GROCY_BASE_URL!)}${normalizedEndpoint}`);
      const response = await this.axiosInstance.request(config);
      
      if (response.status >= 400) {
        console.error(`API error (${response.status}): ${JSON.stringify(response.data)}`);
        throw new Error(`API error (${response.status}): ${JSON.stringify(response.data)}`);
      }
      
      return response.data;
    } catch (error: any) {
      // Improve error handling with more detailed error messages
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error('API request timeout:', error.message);
          throw new Error(`Connection timeout: The server took too long to respond. Please check your network connection or server availability.`);
        } else if (error.code === 'ECONNRESET' || error.message.includes('socket hang up')) {
          console.error('API connection reset:', error.message);
          throw new Error(`Connection reset: The server unexpectedly closed the connection. This might be due to server overload or network issues.`);
        } else if (!error.response) {
          console.error('API network error:', error.message);
          throw new Error(`Network error: Unable to reach the Grocy server. Please verify that the server is running and accessible.`);
        }
      }
      
      console.error('API request error:', error);
      throw error;
    }
  };

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: `${SERVER_NAME}://examples`,
          name: 'Grocy API Usage Examples',
          description: 'Detailed examples of using the Grocy API',
          mimeType: 'text/markdown'
        },
        {
          uri: `${SERVER_NAME}://response-format`,
          name: 'Response Format Documentation',
          description: 'Documentation of the response format and structure',
          mimeType: 'text/markdown'
        },
        {
          uri: `${SERVER_NAME}://config`,
          name: 'Configuration Documentation',
          description: 'Documentation of all configuration options and how to use them',
          mimeType: 'text/markdown'
        }
      ]
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uriPattern = new RegExp(`^${SERVER_NAME}://(.+)$`);
      const match = request.params.uri.match(uriPattern);
      
      if (!match) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Invalid resource URI format: ${request.params.uri}`
        );
      }

      const resource = match[1];
      const fs = await import('fs');
      const path = await import('path');

      try {
        const url = await import('url');
        const __filename = url.fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        
        // In the built app, resources are in build/resources
        // In development, they're in src/resources
        const resourcePath = path.join(__dirname, 'resources', `${resource}.md`);
        const content = await fs.promises.readFile(resourcePath, 'utf8');

        return {
          contents: [{
            uri: request.params.uri,
            mimeType: 'text/markdown',
            text: content
          }]
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Resource not found: ${resource}`
        );
      }
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_stock_volatile',
          description: 'Get volatile stock information (due products, overdue products, expired products, missing products).',
          inputSchema: {
            type: 'object',
            properties: {
              includeDetails: {
                type: 'boolean',
                description: 'Whether to include additional details about each stock item'
              }
            },
            required: [],
          },
        },
        {
          name: 'get_shopping_list',
          description: 'Get your current shopping list items.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_chores',
          description: 'Get all chores from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_tasks',
          description: 'Get all tasks from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_locations',
          description: 'Get all storage locations from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_shopping_locations',
          description: 'Get all shopping locations (stores) from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_product_groups',
          description: 'Get all product groups from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_quantity_units',
          description: 'Get all quantity units from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_users',
          description: 'Get all users from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_recipes_fulfillment',
          description: 'Get fulfillment information for all recipes.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'add_recipe_products_to_shopping_list',
          description: 'Add not fulfilled products of a recipe to the shopping list.',
          inputSchema: {
            type: 'object',
            properties: {
              recipeId: {
                type: 'string',
                description: 'ID of the recipe'
              }
            },
            required: ['recipeId'],
          },
        },
        {
          name: 'undo_action',
          description: 'Undo an action for different entity types (chores, batteries, tasks).',
          inputSchema: {
            type: 'object',
            properties: {
              entityType: {
                type: 'string',
                description: 'Type of entity (chores, batteries, tasks)',
                enum: ['chores', 'batteries', 'tasks']
              },
              id: {
                type: 'string',
                description: 'ID of the execution, charge cycle, or task'
              }
            },
            required: ['entityType', 'id'],
          },
        },
        {
          name: 'get_meal_plan',
          description: 'Get your meal plan data from Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                description: 'Date in YYYY-MM-DD format. Defaults to today.'
              }
            },
            required: [],
          },
        },
        {
          name: 'get_products',
          description: 'Get all products from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_recipes',
          description: 'Get all recipes from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_stock',
          description: 'Get current stock from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_batteries',
          description: 'Get all batteries from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_equipment',
          description: 'Get all equipment from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'add_shopping_list_item',
          description: 'Add an item to your shopping list.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: {
                type: 'number',
                description: 'ID of the product to add'
              },
              amount: {
                type: 'number',
                description: 'Amount to add (default: 1)',
                default: 1
              },
              shoppingListId: {
                type: 'number',
                description: 'ID of the shopping list to add to (default: 1)',
                default: 1
              },
              note: {
                type: 'string',
                description: 'Optional note for the shopping list item'
              }
            },
            required: ['productId'],
          },
        },
        {
          name: 'add_recipe_to_meal_plan',
          description: 'Add a recipe to the meal plan.',
          inputSchema: {
            type: 'object',
            properties: {
              recipeId: {
                type: 'number',
                description: 'ID of the recipe to add'
              },
              day: {
                type: 'string',
                description: 'Day to add the recipe to in YYYY-MM-DD format (default: today)'
              },
              servings: {
                type: 'number',
                description: 'Number of servings (default: 1)',
                default: 1
              }
              // Removed 'section' parameter as it's not supported by the Grocy API
            },
            required: ['recipeId'],
          },
        },
        {
          name: 'inventory_product',
          description: 'Track a product inventory (set current stock amount).',
          inputSchema: {
            type: 'object',
            properties: {
              productId: {
                type: 'number',
                description: 'ID of the product to inventory'
              },
              newAmount: {
                type: 'number',
                description: 'The new total amount in stock'
              },
              bestBeforeDate: {
                type: 'string',
                description: 'Best before date in YYYY-MM-DD format (default: today + 1 year)'
              },
              locationId: {
                type: 'number',
                description: 'ID of the location (optional)'
              },
              note: {
                type: 'string',
                description: 'Optional note'
              }
            },
            required: ['productId', 'newAmount'],
          },
        },
        {
          name: 'create_recipe',
          description: 'Create a new recipe in your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the recipe'
              },
              description: {
                type: 'string',
                description: 'Description of the recipe'
              },
              servings: {
                type: 'number',
                description: 'Number of servings (default: 1)',
                default: 1
              },
              baseServingAmount: {
                type: 'number',
                description: 'Base serving amount (default: 1)',
                default: 1
              },
              desiredServings: {
                type: 'number',
                description: 'Number of desired servings (default: 1)',
                default: 1
              }
            },
            required: ['name'],
          },
        },
        {
          name: 'purchase_product',
          description: 'Track a product purchase in your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: {
                type: 'number',
                description: 'ID of the product to purchase'
              },
              amount: {
                type: 'number',
                description: 'Amount to purchase (default: 1)',
                default: 1
              },
              bestBeforeDate: {
                type: 'string',
                description: 'Best before date in YYYY-MM-DD format (default: today + 1 year)'
              },
              price: {
                type: 'number',
                description: 'Price of the purchase (optional)'
              },
              storeId: {
                type: 'number',
                description: 'ID of the store where purchased (optional)'
              },
              locationId: {
                type: 'number',
                description: 'ID of the storage location (optional)'
              },
              note: {
                type: 'string',
                description: 'Optional note'
              }
            },
            required: ['productId'],
          },
        },
        {
          name: 'consume_product',
          description: 'Track consumption of a product in your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: {
                type: 'number',
                description: 'ID of the product to consume'
              },
              amount: {
                type: 'number',
                description: 'Amount to consume (default: 1)',
                default: 1
              },
              spoiled: {
                type: 'boolean',
                description: 'Whether the product is spoiled (default: false)',
                default: false
              },
              recipeId: {
                type: 'number',
                description: 'ID of the recipe if consuming for a recipe (optional)'
              },
              locationId: {
                type: 'number',
                description: 'ID of the location to consume from (optional)'
              },
              note: {
                type: 'string',
                description: 'Optional note'
              }
            },
            required: ['productId'],
          },
        },
        {
          name: 'track_chore_execution',
          description: 'Track execution of a chore in your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              choreId: {
                type: 'number',
                description: 'ID of the chore that was executed'
              },
              executedBy: {
                type: 'number',
                description: 'ID of the user who executed the chore (optional)'
              },
              tracked_time: {
                type: 'string',
                description: 'When the chore was executed in YYYY-MM-DD HH:MM:SS format (default: now)'
              },
              note: {
                type: 'string',
                description: 'Optional note'
              }
            },
            required: ['choreId'],
          },
        },
        {
          name: 'complete_task',
          description: 'Mark a task as completed in your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'number',
                description: 'ID of the task to complete'
              },
              note: {
                type: 'string',
                description: 'Optional note'
              }
            },
            required: ['taskId'],
          },
        },
        {
          name: 'transfer_product',
          description: 'Transfer a product from one location to another in your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: {
                type: 'number',
                description: 'ID of the product to transfer'
              },
              amount: {
                type: 'number',
                description: 'Amount to transfer (default: 1)',
                default: 1
              },
              locationIdFrom: {
                type: 'number',
                description: 'ID of the source location (required)'
              },
              locationIdTo: {
                type: 'number', 
                description: 'ID of the destination location (required)'
              },
              note: {
                type: 'string',
                description: 'Optional note for this transfer'
              }
            },
            required: ['productId', 'locationIdFrom', 'locationIdTo'],
          },
        },
        {
          name: 'get_price_history',
          description: 'Get the price history of a product from your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: {
                type: 'number',
                description: 'ID of the product to get price history for'
              }
            },
            required: ['productId'],
          },
        },
        {
          name: 'open_product',
          description: 'Mark a product as opened in your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: {
                type: 'number',
                description: 'ID of the product to mark as opened (alternative to stockEntryId)'
              },
              stockEntryId: {
                type: 'number',
                description: 'ID of the specific stock entry to mark as opened (more precise than productId)'
              },
              amount: {
                type: 'number',
                description: 'Amount to mark as opened (default: 1)',
                default: 1
              },
              note: {
                type: 'string',
                description: 'Optional note'
              }
            }
          },
        },
        {
          name: 'get_stock_by_location',
          description: 'Get all stock from a specific location in your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              locationId: {
                type: 'number',
                description: 'ID of the location to get stock for'
              }
            },
            required: ['locationId'],
          },
        },
        {
          name: 'consume_recipe',
          description: 'Consume all ingredients needed for a recipe in your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              recipeId: {
                type: 'number',
                description: 'ID of the recipe to consume'
              },
              servings: {
                type: 'number',
                description: 'Number of servings to consume (default: 1)',
                default: 1
              }
            },
            required: ['recipeId'],
          },
        },
        {
          name: 'charge_battery',
          description: 'Track charging of a battery in your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              batteryId: {
                type: 'number',
                description: 'ID of the battery that was charged'
              },
              trackedTime: {
                type: 'string',
                description: 'When the battery was charged in YYYY-MM-DD HH:MM:SS format (default: now)'
              },
              note: {
                type: 'string',
                description: 'Optional note'
              }
            },
            required: ['batteryId'],
          },
        },
        {
          name: 'add_missing_products_to_shopping_list',
          description: 'Add all missing products for a recipe to your shopping list.',
          inputSchema: {
            type: 'object',
            properties: {
              recipeId: {
                type: 'number',
                description: 'ID of the recipe to add missing products for'
              },
              servings: {
                type: 'number',
                description: 'Number of servings (default: 1)',
                default: 1
              },
              shoppingListId: {
                type: 'number',
                description: 'ID of the shopping list to add to (default: 1)',
                default: 1
              }
            },
            required: ['recipeId'],
          },
        },
        {
          name: 'get_recipe_fulfillment',
          description: 'Get stock fulfillment information for a recipe.',
          inputSchema: {
            type: 'object',
            properties: {
              recipeId: {
                type: 'number',
                description: 'ID of the recipe to check fulfillment for'
              },
              servings: {
                type: 'number',
                description: 'Number of servings (default: 1)',
                default: 1
              }
            },
            required: ['recipeId'],
          },
        },
        {
          name: 'remove_shopping_list_item',
          description: 'Remove an item from your shopping list.',
          inputSchema: {
            type: 'object',
            properties: {
              shoppingListItemId: {
                type: 'number',
                description: 'ID of the shopping list item to remove'
              }
            },
            required: ['shoppingListItemId'],
          },
        },
        {
          name: 'call_grocy_api',
          description: 'Call a specific Grocy API endpoint with custom parameters.',
          inputSchema: {
            type: 'object',
            properties: {
              endpoint: {
                type: 'string',
                description: 'Grocy API endpoint to call (e.g., "objects/products"). Do not include /api/ prefix.'
              },
              method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'HTTP method to use',
                default: 'GET'
              },
              body: {
                type: 'object',
                description: 'Optional request body for POST/PUT requests'
              }
            },
            required: ['endpoint'],
          },
        },
        {
          name: 'test_request',
          description: `Test a REST API endpoint and get detailed response information. Base URL: ${normalizeBaseUrl(process.env.GROCY_BASE_URL!)} | SSL Verification ${GROCY_ENABLE_SSL_VERIFY ? 'enabled' : 'disabled'} (see config resource for SSL settings) | Authentication: ${
  hasApiKeyAuth() ? 
    `API Key using header: GROCY-API-KEY` :
    'No authentication configured'
}`,
          inputSchema: {
            type: 'object',
            properties: {
              method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'HTTP method to use',
              },
              endpoint: {
                type: 'string',
                description: `Endpoint path (e.g. "/users"). Do not include full URLs - only the path.`,
              },
              body: {
                type: 'object',
                description: 'Optional request body for POST/PUT requests',
              },
              headers: {
                type: 'object',
                description: 'Optional request headers for one-time use.',
                additionalProperties: {
                  type: 'string'
                }
              }
            },
            required: ['method', 'endpoint'],
          },
        },
        {
          name: 'get_product_entries',
          description: 'Get all stock entries for a specific product in your Grocy instance.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: {
                type: 'number',
                description: 'ID of the product to get stock entries for'
              }
            },
            required: ['productId'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'test_request':
          return await this.handleTestRequest(request);
        case 'call_grocy_api':
          return await this.handleCustomGrocyApiCall(request);
        case 'open_product':
          return await this.handleOpenProduct(request);
        case 'get_stock_volatile':
          return await this.handleGrocyApiCall('/api/stock/volatile', 'Get volatile stock information', request.params.arguments?.includeDetails ? {query_params: {include_details: "true"}} : {});
        case 'get_shopping_list':
          return await this.handleGrocyApiCall('/objects/shopping_list', 'Get shopping list items');
        case 'get_chores':
          return await this.handleGrocyApiCall('/objects/chores', 'Get all chores');
        case 'get_tasks':
          return await this.handleGrocyApiCall('/objects/tasks', 'Get all tasks');
        case 'get_locations':
          return await this.handleGrocyApiCall('/objects/locations', 'Get all storage locations');
        case 'get_shopping_locations':
          return await this.handleGrocyApiCall('/objects/shopping_locations', 'Get all shopping locations');
        case 'get_product_groups':
          return await this.handleGrocyApiCall('/objects/product_groups', 'Get all product groups');
        case 'get_quantity_units':
          return await this.handleGrocyApiCall('/objects/quantity_units', 'Get all quantity units');
        case 'get_users':
          return await this.handleGrocyApiCall('/users', 'Get all users');
        case 'get_recipe_fulfillment':
          return await this.handleGetRecipeFulfillment(request);
        case 'get_recipes_fulfillment':
          return await this.handleGetRecipesFulfillment(request);
        case 'add_recipe_products_to_shopping_list':
          return await this.handleAddRecipeProductsToShoppingList(request);
        case 'undo_action':
          return await this.handleUndoAction(request);
        case 'get_meal_plan':
          const date = request.params.arguments?.date || new Date().toISOString().split('T')[0];
          return await this.handleGrocyApiCall(`/objects/meal_plan?query%5B%5D=day%3D${date}&limit=100`, 'Get meal plan');
        case 'get_products':
          return await this.handleGrocyApiCall('/objects/products', 'Get all products');
        case 'get_recipes':
          return await this.handleGrocyApiCall('/objects/recipes', 'Get all recipes');
        case 'get_stock':
          return await this.handleGrocyApiCall('/stock', 'Get current stock');
        case 'get_batteries':
          return await this.handleGrocyApiCall('/objects/batteries', 'Get all batteries');
        case 'get_equipment':
          return await this.handleGrocyApiCall('/objects/equipment', 'Get all equipment');
        case 'add_shopping_list_item':
          const { productId: shoppingProductId, amount: shoppingAmount = 1, shoppingListId = 1, note: shoppingNote = '' } = request.params.arguments || {};
          if (!shoppingProductId) {
            throw new McpError(ErrorCode.InvalidParams, 'productId is required');
          }
          const shoppingListItemData = {
            product_id: shoppingProductId,
            amount: shoppingAmount,
            shopping_list_id: shoppingListId,
            note: shoppingNote
          };
          return await this.handleGrocyApiCall('/objects/shopping_list', 'Add shopping list item', {
            method: 'POST',
            body: shoppingListItemData
          });
        case 'add_recipe_to_meal_plan':
          const { recipeId: mealPlanRecipeId, day = new Date().toISOString().split('T')[0], servings: mealPlanServings = 1 } = request.params.arguments || {};
          if (!mealPlanRecipeId) {
            throw new McpError(ErrorCode.InvalidParams, 'recipeId is required');
          }
          const mealPlanData = {
            day: day,
            recipe_id: mealPlanRecipeId,
            recipe_servings: mealPlanServings,
            type: "recipe" // Add the type field to specify this is a recipe entry
          };
          return await this.handleGrocyApiCall('/objects/meal_plan', 'Add recipe to meal plan', {
            method: 'POST',
            body: mealPlanData
          });
        case 'inventory_product':
          const { productId: invProductId, newAmount, bestBeforeDate, locationId, note: invNote } = request.params.arguments || {};
          if (!invProductId || newAmount === undefined) {
            throw new McpError(ErrorCode.InvalidParams, 'productId and newAmount are required');
          }
          // Default best before date is one year from now if not provided
          const defaultBBD = new Date();
          defaultBBD.setFullYear(defaultBBD.getFullYear() + 1);
          const formattedBBD = bestBeforeDate || defaultBBD.toISOString().split('T')[0];
          
          const inventoryData: Record<string, any> = {
            new_amount: newAmount,
            best_before_date: formattedBBD,
            transaction_type: 'inventory-correction'
          };
          
          if (locationId) {
            inventoryData.location_id = locationId;
          }
          
          if (invNote) {
            inventoryData.note = invNote;
          }
          
          // Fix the inventory endpoint path
          return await this.handleGrocyApiCall(`/stock/products/${invProductId}/inventory`, 'Inventory product', {
            method: 'POST',
            body: inventoryData
          });
        case 'create_recipe':
          const { name: recipeName, description: recipeDesc = '', servings: recipeServings = 1, baseServingAmount = 1, desiredServings = 1 } = request.params.arguments || {};
          if (!recipeName) {
            throw new McpError(ErrorCode.InvalidParams, 'Recipe name is required');
          }
          
          const recipeData: Record<string, any> = {
            name: recipeName,
            description: recipeDesc,
            base_servings: recipeServings,
            desired_servings: desiredServings
          };
          
          return await this.handleGrocyApiCall('/objects/recipes', 'Create recipe', {
            method: 'POST',
            body: recipeData
          });
        case 'purchase_product':
          const { productId: purchaseProductId, amount: purchaseAmount = 1, bestBeforeDate: purchaseBBD, price, storeId, locationId: purchaseLocation, note: purchaseNote } = request.params.arguments || {};
          if (!purchaseProductId) {
            throw new McpError(ErrorCode.InvalidParams, 'productId is required');
          }
          
          // Default best before date is one year from now if not provided
          const defaultPurchaseBBD = new Date();
          defaultPurchaseBBD.setFullYear(defaultPurchaseBBD.getFullYear() + 1);
          const formattedPurchaseBBD = purchaseBBD || defaultPurchaseBBD.toISOString().split('T')[0];
          
          const purchaseData: Record<string, any> = {
            amount: purchaseAmount,
            transaction_type: 'purchase',
            best_before_date: formattedPurchaseBBD
          };
          
          if (price !== undefined) {
            purchaseData.price = price;
          }
          
          if (storeId) {
            purchaseData.shopping_location_id = storeId;
          }
          
          if (purchaseLocation) {
            purchaseData.location_id = purchaseLocation;
          }
          
          if (purchaseNote) {
            purchaseData.note = purchaseNote;
          }
          
          return await this.handleGrocyApiCall(`/stock/products/${purchaseProductId}/add`, 'Purchase product', {
            method: 'POST',
            body: purchaseData
          });
        case 'consume_product':
          const { productId: consumeProductId, amount: consumeAmount = 1, spoiled = false, recipeId: consumeRecipeIdParam, locationId: consumeLocation, note: consumeNote } = request.params.arguments || {};
          if (!consumeProductId) {
            throw new McpError(ErrorCode.InvalidParams, 'productId is required');
          }
          
          const consumeData: Record<string, any> = {
            amount: consumeAmount,
            transaction_type: spoiled ? 'consume-spoiled' : 'consume',
            spoiled: spoiled
          };
          
          if (consumeRecipeIdParam) {
            consumeData.recipe_id = consumeRecipeIdParam;
          }
          
          if (consumeLocation) {
            consumeData.location_id = consumeLocation;
          }
          
          if (consumeNote) {
            consumeData.note = consumeNote;
          }
          
          // The stock/products endpoint needs special handling
          return await this.handleGrocyApiCall(`/stock/products/${consumeProductId}/consume`, 'Consume product', {
            method: 'POST',
            body: consumeData
          });
        case 'track_chore_execution':
          const { choreId, executedBy, tracked_time, note: choreNote } = request.params.arguments || {};
          if (!choreId) {
            throw new McpError(ErrorCode.InvalidParams, 'choreId is required');
          }
          
          const choreTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
          const executeUrl = `/api/chores/${choreId}/execute`;
          console.error(`Executing chore with URL: ${executeUrl}`); // Using stderr instead of stdout
          
          const choreData = {
            tracked_time: tracked_time || choreTimestamp,
            ...(executedBy ? { done_by: executedBy } : {}),
            ...(choreNote ? { note: choreNote } : {})
          };
          
          // Use call_grocy_api approach since this endpoint is problematic
          return await this.handleCustomGrocyApiCall({
            params: {
              arguments: {
                endpoint: `chores/${choreId}/execute`,
                method: 'POST',
                body: choreData
              }
            }
          });
        case 'complete_task':
          const { taskId, note: taskNote } = request.params.arguments || {};
          if (!taskId) {
            throw new McpError(ErrorCode.InvalidParams, 'taskId is required');
          }
          
          // Use call_grocy_api approach since this endpoint is problematic
          return await this.handleCustomGrocyApiCall({
            params: {
              arguments: {
                endpoint: `tasks/${taskId}/complete`,
                method: 'POST',
                body: taskNote ? { note: taskNote } : {}
              }
            }
          });
        case 'transfer_product':
          const { productId: transferProductId, amount: transferAmount = 1, locationIdFrom, locationIdTo, note: transferNote } = request.params.arguments || {};
          if (!transferProductId || !locationIdFrom || !locationIdTo) {
            throw new McpError(ErrorCode.InvalidParams, 'productId, locationIdFrom, and locationIdTo are required');
          }
          
          const transferData: Record<string, any> = {
            amount: transferAmount,
            location_id_from: locationIdFrom,
            location_id_to: locationIdTo,
            transaction_type: 'transfer'
          };
          
          if (transferNote) {
            transferData.note = transferNote;
          }
          
          return await this.handleGrocyApiCall(`/stock/products/${transferProductId}/transfer`, 'Transfer product', {
            method: 'POST',
            body: transferData
          });
        case 'get_price_history':
          const { productId: priceHistoryProductId } = request.params.arguments || {};
          if (!priceHistoryProductId) {
            throw new McpError(ErrorCode.InvalidParams, 'productId is required');
          }
          
          return await this.handleGrocyApiCall(`/stock/products/${priceHistoryProductId}/price-history`, 'Get product price history', {
          });
        case 'get_stock_by_location':
          const { locationId: stockLocationId } = request.params.arguments || {};
          if (!stockLocationId) {
            throw new McpError(ErrorCode.InvalidParams, 'locationId is required');
          }
          
          // Use the handleCustomGrocyApiCall approach which has been working better for special endpoints
          return await this.handleCustomGrocyApiCall({
            params: {
              arguments: {
                endpoint: `stock?location_id=${stockLocationId}`,
                method: 'GET'
              }
            }
          });
        case 'consume_recipe':
          const { recipeId: recipeToConsumeId, servings: recipeConsumeServings = 1 } = request.params.arguments || {};
          if (!recipeToConsumeId) {
            throw new McpError(ErrorCode.InvalidParams, 'recipeId is required');
          }
          
          const consumeRecipeData: Record<string, any> = {
            recipe_id: recipeToConsumeId,
            servings: recipeConsumeServings
          };
          
          return await this.handleGrocyApiCall(`/recipes/${recipeToConsumeId}/consume`, 'Consume recipe', {
            method: 'POST',
            body: consumeRecipeData
          });
        case 'charge_battery':
          const { batteryId, trackedTime, note: batteryNote } = request.params.arguments || {};
          if (!batteryId) {
            throw new McpError(ErrorCode.InvalidParams, 'batteryId is required');
          }
          
          const batteryTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
          
          // Use the direct API call method which has proven more reliable
          return await this.handleCustomGrocyApiCall({
            params: {
              arguments: {
                endpoint: `batteries/${batteryId}/charge`,
                method: 'POST',
                body: {
                  tracked_time: trackedTime || batteryTimestamp,
                  ...(batteryNote ? { note: batteryNote } : {})
                }
              }
            }
          });
        case 'add_missing_products_to_shopping_list':
          const { recipeId: missingRecipeId, servings: missingServings = 1, shoppingListId: missingShoppingListId = 1 } = request.params.arguments || {};
          if (!missingRecipeId) {
            throw new McpError(ErrorCode.InvalidParams, 'recipeId is required');
          }
          
          // Use the direct API call method which has proven more reliable
          return await this.handleCustomGrocyApiCall({
            params: {
              arguments: {
                endpoint: `recipes/${missingRecipeId}/add-not-fulfilled-products-to-shoppinglist`,
                method: 'POST',
                body: {
                  servings: missingServings,
                  shopping_list_id: missingShoppingListId
                }
              }
            }
          });
        case 'remove_shopping_list_item':
          const { shoppingListItemId } = request.params.arguments || {};
          if (!shoppingListItemId) {
            throw new McpError(ErrorCode.InvalidParams, 'shoppingListItemId is required');
          }
          
          return await this.handleGrocyApiCall(`/objects/shopping_list/${shoppingListItemId}`, 'Remove shopping list item', {
            method: 'DELETE'
          });
        case 'get_product_entries':
          const { productId: entriesProductId } = request.params.arguments || {};
          if (!entriesProductId) {
            throw new McpError(ErrorCode.InvalidParams, 'productId is required');
          }
          return await this.handleGrocyApiCall(`/stock/products/${entriesProductId}/entries`, 'Get product entries');
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  /**
   * Helper function to safely stringify JSON to prevent malformed responses
   * @param data The data to stringify
   * @returns A properly escaped JSON string
   */
  private safeJsonStringify(data: any): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error stringifying JSON:', error);
      return JSON.stringify({ error: 'Error formatting response data' }, null, 2);
    }
  }

  private async handleCustomGrocyApiCall(request: any) {
    const { endpoint, method = 'GET', body = null } = request.params.arguments;
    
    if (!endpoint) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameter: endpoint'
      );
    }

    // Remove leading /api/ if present
    const cleanEndpoint = endpoint.replace(/^\/?(api\/)?/, '');
    
    try {
      const data = await this.makeApiRequest(`/${cleanEndpoint}`, method, body);
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify(data),
          },
        ],
      };
    } catch (error: any) {
      console.error(`Error calling Grocy API endpoint ${endpoint}:`, error);
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify({
              error: `Failed to call Grocy API endpoint ${endpoint}: ${error.message}`
            }),
          },
        ],
        isError: true,
      };
    }
  }

  private async handleGrocyApiCall(endpoint: string, description: string, options: any = {}) {
    try {
      // For query parameters
      let adjustedEndpoint = endpoint;
      if (options.query_params) {
        const queryString = Object.entries(options.query_params)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');
        
        if (queryString) {
          adjustedEndpoint += `?${queryString}`;
        }
      }
      
      const method = options.method || 'GET';
      const body = options.body || null;
      const additionalHeaders = options.headers || {};
      const isSpecial = options.is_special || false;
      
      const data = await this.makeApiRequest(adjustedEndpoint, method, body, additionalHeaders, isSpecial);
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify(data),
          },
        ],
      };
    } catch (error: any) {
      console.error(`Error in ${description}:`, error);
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify({
              error: `Failed to ${description.toLowerCase()}: ${error.message}`
            }),
          },
        ],
        isError: true,
      };
    }
  }

  private async handleTestRequest(request: any) {
    if (!isValidEndpointArgs(request.params.arguments)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid test endpoint arguments'
      );
    }

    // Ensure endpoint starts with / and remove any trailing slashes
    const normalizedEndpoint = `/${request.params.arguments.endpoint.replace(/^\/+|\/+$/g, '')}`;
    
    // Initialize request config
    const config: AxiosRequestConfig = {
        method: request.params.arguments.method as Method,
        url: normalizedEndpoint,
        headers: {},
      };

    // Add request body for POST/PUT
    if (['POST', 'PUT'].includes(request.params.arguments.method) && request.params.arguments.body) {
      config.data = request.params.arguments.body;
    }

    // Apply headers in order of priority (lowest to highest)
    
    // 1. Custom global headers (lowest priority)
    const customHeaders = getCustomHeaders();
    config.headers = {
      ...customHeaders,
      ...config.headers,
      ...(request.params.arguments.headers || {}) // Request-specific headers (middle priority)
    };

    // 3. Authentication headers (highest priority)
    // Only API Key authentication is supported now
    if (hasApiKeyAuth()) {
      config.headers = {
        ...config.headers,
        [AUTH_APIKEY_HEADER_NAME as string]: GROCY_APIKEY_VALUE
      };
    }

    try {
      const startTime = Date.now();
      const response = await this.axiosInstance.request(config);
      const endTime = Date.now();
      const fullUrl = `${process.env.GROCY_BASE_URL}${normalizedEndpoint}`;

      // Determine auth method used - only API Key is supported now
      let authMethod = hasApiKeyAuth() ? 'apikey' : 'none';

      // Prepare response object
      const responseObj: ResponseObject = {
        request: {
          url: fullUrl,
          method: config.method || 'GET',
          headers: {
            ...sanitizeHeaders(config.headers as Record<string, string | undefined>, false),
            ...sanitizeHeaders(request.params.arguments.headers || {}, true)
          },
          body: config.data,
          authMethod
        },
        response: {
          statusCode: response.status,
          statusText: response.statusText,
          timing: `${endTime - startTime}ms`,
          headers: sanitizeHeaders(response.headers as Record<string, any>, false),
          body: response.data,
        },
        validation: {
          isError: response.status >= 400,
          messages: response.status >= 400 ? 
            [`Request failed with status ${response.status}`] : 
            ['Request completed successfully']
        }
      };

      // Check response body size independently
      const bodyStr = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      const bodySize = Buffer.from(bodyStr).length;

      if (bodySize > RESPONSE_SIZE_LIMIT) {
        // Simply truncate to the size limit
        responseObj.response.body = bodyStr.slice(0, RESPONSE_SIZE_LIMIT);
        responseObj.validation.messages.push(
          `Response truncated: ${RESPONSE_SIZE_LIMIT} of ${bodySize} bytes returned due to size limit (${RESPONSE_SIZE_LIMIT} bytes)`
        );
        responseObj.validation.truncated = {
          originalSize: bodySize,
          returnedSize: RESPONSE_SIZE_LIMIT,
          truncationPoint: RESPONSE_SIZE_LIMIT,
          sizeLimit: RESPONSE_SIZE_LIMIT
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify(responseObj),
          },
        ],
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return {
          content: [
            {
              type: 'text',
              text: this.safeJsonStringify({
                error: {
                  message: error.message,
                  code: error.code,
                  request: {
                    url: `${process.env.GROCY_BASE_URL}${normalizedEndpoint}`,
                    method: config.method,
                    headers: {
                      ...sanitizeHeaders(config.headers as Record<string, string | undefined>, false),
                      ...sanitizeHeaders(request.params.arguments.headers || {}, true)
                    },
                    body: config.data
                  }
                }
              }),
            },
          ],
          isError: true,
        };
      }
      throw error;
    }
  }

  private async handleOpenProduct(request: any) {
    const { productId, stockEntryId, amount = 1, note } = request.params.arguments;
    
    if (!productId && !stockEntryId) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Either productId or stockEntryId must be provided'
      );
    }

    // Construct the request body
    const body: any = { amount };
    if (note) body.note = note;
    
    // If stockEntryId is provided, include it in the request
    if (stockEntryId) body.stock_entry_id = stockEntryId;
    
    try {
      // If we don't have a productId but have a stockEntryId, we need to fetch the product ID first
      let targetProductId = productId;
      
      if (!productId && stockEntryId) {
        console.error(`No product ID provided but stock entry ID ${stockEntryId} given. Attempting to get product ID from stock entry.`);
        
        try {
          // First try to get the product ID from the stock entry
          const stockEntryData = await this.makeApiRequest(`/api/stock/entry/${stockEntryId}`, 'GET');
          if (stockEntryData && stockEntryData.product_id) {
            targetProductId = stockEntryData.product_id;
            console.error(`Successfully resolved product ID ${targetProductId} from stock entry ${stockEntryId}`);
          } else {
            throw new Error(`Could not resolve product ID from stock entry ${stockEntryId}`);
          }
        } catch (stockEntryError: any) {
          console.error(`Failed to get product ID from stock entry: ${stockEntryError.message}`);
          // Continue with the error handling below
          throw new Error(`Failed to get product ID from stock entry: ${stockEntryError.message}`);
        }
      }
      
      if (!targetProductId) {
        throw new Error('Unable to determine product ID for open operation');
      }
      
      // Use the proper path format with explicit /api prefix
      const endpoint = `/api/stock/products/${targetProductId}/open`;
      console.error(`Making open product request to ${endpoint} with body:`, body);
      
      // Don't use isSpecial=true flag as we're now using the explicit /api prefix
      const data = await this.makeApiRequest(endpoint, 'POST', body);
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify(data),
          },
        ],
      };
    } catch (error: any) {
      console.error(`Error opening product:`, error);
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify({
              error: `Failed to open product: ${error.message}`,
              help: "When using productId, Grocy will automatically use first-in-first-out for stock selection. For more precise control, use stockEntryId instead. To find valid stock entry IDs, use the get_product_entries tool with your productId.",
              example: "Try using the get_product_entries tool with the product ID to find valid stock entries for a specific product"
            }),
          },
        ],
        isError: true,
      };
    }
  }

  private async handleGetRecipeFulfillment(request: any) {
    const { recipeId } = request.params.arguments;
    try {
      const data = await this.makeApiRequest(`/recipes/${recipeId}/fulfillment`, 'GET');
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify(data),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify({
              error: `Failed to get recipe fulfillment: ${error.message}`,
            }),
          },
        ],
        isError: true,
      };
    }
  }

  private async handleGetRecipesFulfillment(request: any) {
    try {
      const data = await this.makeApiRequest(`/recipes/fulfillment`, 'GET');
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify(data),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify({
              error: `Failed to get all recipes fulfillment: ${error.message}`,
            }),
          },
        ],
        isError: true,
      };
    }
  }

  private async handleAddRecipeProductsToShoppingList(request: any) {
    const { recipeId } = request.params.arguments;
    try {
      const data = await this.makeApiRequest(`/recipes/${recipeId}/add-not-fulfilled-products-to-shoppinglist`, 'POST');
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify(data),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify({
              error: `Failed to add recipe products to shopping list: ${error.message}`,
            }),
          },
        ],
        isError: true,
      };
    }
  }

  private async handleUndoAction(request: any) {
    const { entityType, id } = request.params.arguments;
    
    let endpoint;
    switch (entityType.toLowerCase()) {
      case 'chore':
      case 'chores':
        endpoint = `/chores/executions/${id}/undo`;
        break;
      case 'battery':
      case 'batteries':
        endpoint = `/batteries/charge-cycles/${id}/undo`;
        break;
      case 'task':
      case 'tasks':
        endpoint = `/tasks/${id}/undo`;
        break;
      default:
        return {
          content: [
            {
              type: 'text',
              text: this.safeJsonStringify({
                error: `Unsupported entity type: ${entityType}`,
              }),
            },
          ],
          isError: true,
        };
    }
    
    try {
      const data = await this.makeApiRequest(endpoint, 'POST');
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify(data),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: this.safeJsonStringify({
              error: `Failed to undo ${entityType} action: ${error.message}`,
            }),
          },
        ],
        isError: true,
      };
    }
  }

  async run() {
    await this.setupServer();
    
    // Start STDIO transport
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Grocy API MCP server running on stdio');

    // Start HTTP/SSE transport
    // Process environment variables with detailed logging
    console.error('[CONFIG] ENABLE_HTTP_SERVER:', process.env.ENABLE_HTTP_SERVER);
    console.error('[CONFIG] HTTP_SERVER_PORT:', process.env.HTTP_SERVER_PORT);
    
    // Accept various formats of "true" values for better compatibility
    const enableHttpServer = ['true', 'yes', '1', 'on', 'enabled'].includes(String(process.env.ENABLE_HTTP_SERVER || '').toLowerCase());
    
    console.error(`[CONFIG] HTTP Server will be ${enableHttpServer ? 'enabled' : 'disabled'}`);
    
    if (enableHttpServer) {
      try {
        // Parse port or use default
        const portStr = process.env.HTTP_SERVER_PORT;
        const port = portStr ? parseInt(String(portStr), 10) : 8080;
        
        if (isNaN(port)) {
          console.error(`[ERROR] Invalid HTTP port value: ${portStr}, using default 8080`);
        }
        
        // Start HTTP server
        console.error(`[CONFIG] Starting HTTP/SSE server on port ${port}`);
        startHttpServer(this.server, port);
      } catch (error) {
        console.error(`[ERROR] Failed to start HTTP/SSE server:`, error);
      }
    } else {
      console.error('[CONFIG] HTTP/SSE server is disabled');
      console.error('[CONFIG] To enable, set ENABLE_HTTP_SERVER=true in environment variables');
    }
  }
}

const server = new GrocyApiServer();
server.run().catch(console.error);
