#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import { VERSION, SERVER_NAME } from './version.js';

if (!process.env.REST_BASE_URL) {
  throw new Error('REST_BASE_URL environment variable is required');
}

// Default response size limit: 10KB (10000 bytes)
const RESPONSE_SIZE_LIMIT = process.env.REST_RESPONSE_SIZE_LIMIT 
  ? parseInt(process.env.REST_RESPONSE_SIZE_LIMIT, 10)
  : 10000;

if (isNaN(RESPONSE_SIZE_LIMIT) || RESPONSE_SIZE_LIMIT <= 0) {
  throw new Error('REST_RESPONSE_SIZE_LIMIT must be a positive number');
}
const AUTH_BASIC_USERNAME = process.env.AUTH_BASIC_USERNAME;
const AUTH_BASIC_PASSWORD = process.env.AUTH_BASIC_PASSWORD;
const AUTH_BEARER = process.env.AUTH_BEARER;
const AUTH_APIKEY_HEADER_NAME = process.env.AUTH_APIKEY_HEADER_NAME;
const AUTH_APIKEY_VALUE = process.env.AUTH_APIKEY_VALUE;
const REST_ENABLE_SSL_VERIFY = process.env.REST_ENABLE_SSL_VERIFY !== 'false';

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

const isValidEndpointArgs = (args: any): args is EndpointArgs => {
  if (typeof args !== 'object' || args === null) return false;
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(args.method)) return false;
  if (typeof args.endpoint !== 'string') return false;
  if (args.headers !== undefined && typeof args.headers !== 'object') return false;
  return true;
};

const hasBasicAuth = () => AUTH_BASIC_USERNAME && AUTH_BASIC_PASSWORD;
const hasBearerAuth = () => !!AUTH_BEARER;
const hasApiKeyAuth = () => AUTH_APIKEY_HEADER_NAME && AUTH_APIKEY_VALUE;

class RestTester {
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
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    const https = await import('https');
    this.axiosInstance = axios.create({
      baseURL: process.env.REST_BASE_URL,
      validateStatus: () => true, // Allow any status code
      httpsAgent: REST_ENABLE_SSL_VERIFY ? undefined : new https.Agent({ // Disable SSL verification only when explicitly set to false
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
  }

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: `${SERVER_NAME}://examples`,
          name: 'REST API Usage Examples',
          description: 'Detailed examples of using the REST API testing tool',
          mimeType: 'text/markdown'
        },
        {
          uri: `${SERVER_NAME}://response-format`,
          name: 'Response Format Documentation',
          description: 'Documentation of the response format and structure',
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
          name: 'test_request',
          description: `Test a REST API endpoint and get detailed response information. 

Base URL: ${process.env.REST_BASE_URL}

SSL Verification: ${REST_ENABLE_SSL_VERIFY ? 'Enabled (default)' : 'Disabled (set REST_ENABLE_SSL_VERIFY=false to disable for self-signed certificates)'}

Authentication: ${
  hasBasicAuth() ? 
    `Basic Auth with username: ${AUTH_BASIC_USERNAME}` :
  hasBearerAuth() ? 
    'Bearer token authentication configured' :
  hasApiKeyAuth() ? 
    `API Key using header: ${AUTH_APIKEY_HEADER_NAME}` :
    'No authentication configured'
}

The tool automatically:
- Normalizes endpoints (adds leading slash, removes trailing slashes)
- Handles authentication header injection
- Accepts any HTTP status code as valid
- Limits response size to ${RESPONSE_SIZE_LIMIT} bytes (configurable via REST_RESPONSE_SIZE_LIMIT)
- Returns detailed response information including:
  * Full URL called
  * Status code and text
  * Response headers
  * Response body
  * Request details (method, headers, body)
  * Response timing
  * Validation messages

Error Handling:
- Network errors are caught and returned with descriptive messages
- Invalid status codes are still returned with full response details
- Authentication errors include the attempted auth method
`,
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
                description: 'Endpoint path (e.g. "/users"). Will be appended to base URL.',
              },
              body: {
                type: 'object',
                description: 'Optional request body for POST/PUT requests',
              },
              headers: {
                type: 'object',
                description: 'Optional request headers',
                additionalProperties: {
                  type: 'string',
                },
              },
            },
            required: ['method', 'endpoint'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'test_request') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

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
          headers: request.params.arguments.headers || {},
        };

      // Add request body for POST/PUT
      if (['POST', 'PUT'].includes(request.params.arguments.method) && request.params.arguments.body) {
        config.data = request.params.arguments.body;
      }

      // Handle authentication based on environment variables
      if (hasBasicAuth()) {
        const base64Credentials = Buffer.from(`${AUTH_BASIC_USERNAME}:${AUTH_BASIC_PASSWORD}`).toString('base64');
        config.headers = {
          ...config.headers,
          'Authorization': `Basic ${base64Credentials}`
        };
      } else if (hasBearerAuth()) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${AUTH_BEARER}`
        };
      } else if (hasApiKeyAuth()) {
        config.headers = {
          ...config.headers,
          [AUTH_APIKEY_HEADER_NAME as string]: AUTH_APIKEY_VALUE
        };
      }

      try {
        const startTime = Date.now();
        const response = await this.axiosInstance.request(config);
        const endTime = Date.now();
        const fullUrl = `${process.env.REST_BASE_URL}${normalizedEndpoint}`;

        // Determine auth method used
        let authMethod = 'none';
        if (hasBasicAuth()) authMethod = 'basic';
        else if (hasBearerAuth()) authMethod = 'bearer';
        else if (hasApiKeyAuth()) authMethod = 'apikey';

        // Prepare response object
        const responseObj: ResponseObject = {
          request: {
            url: fullUrl,
            method: config.method || 'GET',
          headers: config.headers as Record<string, string | undefined>,
            body: config.data,
            authMethod
          },
          response: {
            statusCode: response.status,
            statusText: response.statusText,
            timing: `${endTime - startTime}ms`,
          headers: response.headers as Record<string, any>,
            body: response.data,
          },
          validation: {
            isError: response.status >= 400,
            messages: response.status >= 400 ? 
              [`Request failed with status ${response.status}`] : 
              ['Request completed successfully']
          }
        };

        // Check response size
        const stringified = JSON.stringify(responseObj, null, 2);
        const totalBytes = Buffer.from(stringified).length;

        if (totalBytes > RESPONSE_SIZE_LIMIT) {
          // Convert body to string if it isn't already
          const bodyStr = typeof response.data === 'string' 
            ? response.data 
            : JSON.stringify(response.data);
          
          // Calculate how much we need to truncate
          const currentSize = Buffer.from(bodyStr).length;
          const targetSize = Math.max(0, currentSize - (totalBytes - RESPONSE_SIZE_LIMIT));
          
          // Create truncated response
          responseObj.response.body = bodyStr.slice(0, targetSize);
          responseObj.validation.messages.push(
            `Response truncated: ${targetSize} of ${currentSize} bytes returned due to size limit (${RESPONSE_SIZE_LIMIT} bytes)`
          );
          responseObj.validation.truncated = {
            originalSize: currentSize,
            returnedSize: targetSize,
            truncationPoint: targetSize,
            sizeLimit: RESPONSE_SIZE_LIMIT
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(responseObj, null, 2),
            },
          ],
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            content: [
              {
                type: 'text',
              text: JSON.stringify({
                error: {
                  message: error.message,
                  code: error.code,
                  request: {
                    url: `${process.env.REST_BASE_URL}${normalizedEndpoint}`,
                    method: config.method,
                    headers: config.headers,
                    body: config.data
                  }
                }
              }, null, 2),
              },
            ],
            isError: true,
          };
        }
        throw error;
      }
    });
  }

  async run() {
    await this.setupServer();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('REST API Tester MCP server running on stdio');
  }
}

const server = new RestTester();
server.run().catch(console.error);
