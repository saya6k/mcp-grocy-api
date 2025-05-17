# 1.0.0-dev.1 (2025-05-17)


### Bug Fixes

* ci bugfix ([2ecd332](https://github.com/saya6k/mcp-grocy-api/commit/2ecd3329034d1bcf8c7e9e202592a84ee01c049f))
* ci more bug fix ([85ee8aa](https://github.com/saya6k/mcp-grocy-api/commit/85ee8aad46b88549f0a56159e4403eaf85aeef82))
* **ci:** correct workflow configuration and Docker build issues ([2ce9692](https://github.com/saya6k/mcp-grocy-api/commit/2ce96920612e0c22fca104c7dc79e88bcdd1ea0b))
* **ci:** replace conventional-changelog with semantic-release ([9412a4b](https://github.com/saya6k/mcp-grocy-api/commit/9412a4bd5999fba409738263aca2f9e95a7a395f))
* configure server capabilities as empty objects for MCP compatibility ([790f352](https://github.com/saya6k/mcp-grocy-api/commit/790f35233bac8ba15f19a6aa62eb8d991144d266))
* correct capability types in server initialization to fix TypeScript errors ([19e6c79](https://github.com/saya6k/mcp-grocy-api/commit/19e6c79a195b5781f87d91ba809d39514553191e))
* correct response truncation to return first N bytes ([ce34649](https://github.com/saya6k/mcp-grocy-api/commit/ce34649c4d8e6bc6d740e8f3fbc6e3df517e0eec))
* ignore config.yaml (automatically update) ([a644b2e](https://github.com/saya6k/mcp-grocy-api/commit/a644b2ee7c5e30a3e692c7b90b2b22f0fd390fc1))
* improve Docker build and test workflow ([346b25b](https://github.com/saya6k/mcp-grocy-api/commit/346b25ba9b1bec053b802b54f9272b527b319fcb))
* improve npm publishing configuration ([6bc0a6b](https://github.com/saya6k/mcp-grocy-api/commit/6bc0a6ba260f00bedd122cb88450d33b6a2d3d54))
* prevent npm publishing from dev branch and use separate semantic-release configs ([b5a8e40](https://github.com/saya6k/mcp-grocy-api/commit/b5a8e40be17a2fb4cbe43ab49d17fa651de32245))
* remove redundant get_recipe_fulfillment tool definition ([ebcef9b](https://github.com/saya6k/mcp-grocy-api/commit/ebcef9ba0585db20e0bcfcb2bc519f5989cfba54))
* remove redundant resource file duplication in build process ([0ec729c](https://github.com/saya6k/mcp-grocy-api/commit/0ec729c16169493d92e3b13ed2ea37514c038fba))
* removed duplicate case statements for open_product and get_recipe_fulfillment tools ([a745f2d](https://github.com/saya6k/mcp-grocy-api/commit/a745f2d6e3dc5dc8bfcc28c4e9b632f01fc580f8))
* replace npm ci with npm install in pipeline.yml ([d07ee07](https://github.com/saya6k/mcp-grocy-api/commit/d07ee078e90edb580cafa61b00a7e732524db11d))
* resolve Docker build and GitHub Actions workflow issues ([1d0cfc8](https://github.com/saya6k/mcp-grocy-api/commit/1d0cfc823d567ef22eead3709e810cc0b663c0d9))
* resolve Docker build errors and security warnings ([9e761f3](https://github.com/saya6k/mcp-grocy-api/commit/9e761f300e91a2e697389c698a682cac9274e33c))
* resolve npm package naming error ([d1270e1](https://github.com/saya6k/mcp-grocy-api/commit/d1270e12097621736df1a349789b98ad2e61a95e))
* resolve npm packaging and CI/CD issues ([bbeb2e7](https://github.com/saya6k/mcp-grocy-api/commit/bbeb2e73c9f8bbcc2b624b0b9d3a2320ec614ed4))
* resolved schema validation error in open_product tool ([54f7815](https://github.com/saya6k/mcp-grocy-api/commit/54f7815f0eb6473347b7d1d759ce1dac5148fef5))
* simplified schema for open_product tool to avoid unsupported anyOf constraint ([d6e65ce](https://github.com/saya6k/mcp-grocy-api/commit/d6e65cecd1c0790121821be97e24350dead924b9))
* typo in test-build.sh ([b69c7f1](https://github.com/saya6k/mcp-grocy-api/commit/b69c7f1c0720e1d25bad8f35ea9cf0517a29d84b))
* update Docker build process by using --ignore-scripts flag ([2fc7fdf](https://github.com/saya6k/mcp-grocy-api/commit/2fc7fdf60e08c0628b1f47c5e3a4897e13519090))
* update npm publishing configuration for semantic-release ([f820222](https://github.com/saya6k/mcp-grocy-api/commit/f8202227d5c40eace97f760cdc35396ef20d9be0))
* update SDK version and fix version imports ([e6d6f51](https://github.com/saya6k/mcp-grocy-api/commit/e6d6f5113a159b059244c47630982541e7169b38))
* update server initialization to strictly follow MCP specification ([e632531](https://github.com/saya6k/mcp-grocy-api/commit/e632531d0bbe470fac319820adf56838be52e1ad))
* use .cjs extension for conventional changelog config ([9f7cda3](https://github.com/saya6k/mcp-grocy-api/commit/9f7cda3b656c2abadee131350201d4464e046fae))


### Features

* add config documentation and improve URL resolution examples ([8c6100f](https://github.com/saya6k/mcp-grocy-api/commit/8c6100f47777605a0571edbd161ffd20fc48b640))
* add custom header support ([9a48e0d](https://github.com/saya6k/mcp-grocy-api/commit/9a48e0d794a743f7a62c7cb73d6f5b1be9e44107))
* add Grocy API reference in resources ([d5d7d65](https://github.com/saya6k/mcp-grocy-api/commit/d5d7d6509bd9168236df72bf39352575ce9533c6))
* add Home Assistant addon support ([1e3b440](https://github.com/saya6k/mcp-grocy-api/commit/1e3b44001c16631c28cf875d89114d786b6573e7))
* add MCP resources for documentation ([a20cf35](https://github.com/saya6k/mcp-grocy-api/commit/a20cf352e9731841a8d7e833007a96bdd1a0c390))
* Enhance Grocy API compatibility with version 4.5.0 ([a9c252e](https://github.com/saya6k/mcp-grocy-api/commit/a9c252e387cbd28466bc55c8e7db7b28af1dd6d3))
* Enhance Grocy API compatibility with version 4.5.0 ([4c4fe00](https://github.com/saya6k/mcp-grocy-api/commit/4c4fe0046258141fc82fc6f35b6d668106bb254e))
* **ssl:** add SSL verification control with secure defaults ([0fdbe84](https://github.com/saya6k/mcp-grocy-api/commit/0fdbe844dd4ce8b79f38a33df323a29e28253724))
* update CI/CD pipeline to run on both main and dev branches ([3c5a255](https://github.com/saya6k/mcp-grocy-api/commit/3c5a255a8628c5cd3e2fcfbc6148eb12c6aa5ef1))

# [1.3.0](https://github.com/saya6k/mcp-grocy-api/compare/v1.2.0...v1.3.0) (2025-05-17)


### Features

* add Grocy API reference in resources ([d5d7d65](https://github.com/saya6k/mcp-grocy-api/commit/d5d7d6509bd9168236df72bf39352575ce9533c6))

# [1.2.0](https://github.com/saya6k/mcp-grocy-api/compare/v1.1.2...v1.2.0) (2025-05-17)


### Bug Fixes

* resolve Docker build errors and security warnings ([9e761f3](https://github.com/saya6k/mcp-grocy-api/commit/9e761f300e91a2e697389c698a682cac9274e33c))


### Features

* add Home Assistant addon support ([1e3b440](https://github.com/saya6k/mcp-grocy-api/commit/1e3b44001c16631c28cf875d89114d786b6573e7))

## [1.1.2](https://github.com/saya6k/mcp-grocy-api/compare/v1.1.1...v1.1.2) (2025-05-17)


### Bug Fixes

* ignore config.yaml (automatically update) ([a644b2e](https://github.com/saya6k/mcp-grocy-api/commit/a644b2ee7c5e30a3e692c7b90b2b22f0fd390fc1))

## [1.1.1](https://github.com/saya6k/mcp-grocy-api/compare/v1.1.0...v1.1.1) (2025-05-17)


### Bug Fixes

* remove redundant resource file duplication in build process ([0ec729c](https://github.com/saya6k/mcp-grocy-api/commit/0ec729c16169493d92e3b13ed2ea37514c038fba))

# [1.1.0](https://github.com/saya6k/mcp-grocy-api/compare/v1.0.9...v1.1.0) (2025-05-17)


### Bug Fixes

* remove redundant get_recipe_fulfillment tool definition ([ebcef9b](https://github.com/saya6k/mcp-grocy-api/commit/ebcef9ba0585db20e0bcfcb2bc519f5989cfba54))


### Features

* Enhance Grocy API compatibility with version 4.5.0 ([a9c252e](https://github.com/saya6k/mcp-grocy-api/commit/a9c252e387cbd28466bc55c8e7db7b28af1dd6d3))
* Enhance Grocy API compatibility with version 4.5.0 ([4c4fe00](https://github.com/saya6k/mcp-grocy-api/commit/4c4fe0046258141fc82fc6f35b6d668106bb254e))
* update CI/CD pipeline to run on both main and dev branches ([3c5a255](https://github.com/saya6k/mcp-grocy-api/commit/3c5a255a8628c5cd3e2fcfbc6148eb12c6aa5ef1))

## [1.0.9](https://github.com/saya6k/mcp-grocy-api/compare/v1.0.8...v1.0.9) (2025-05-16)


### Bug Fixes

* configure server capabilities as empty objects for MCP compatibility ([790f352](https://github.com/saya6k/mcp-grocy-api/commit/790f35233bac8ba15f19a6aa62eb8d991144d266))

## [1.0.8](https://github.com/saya6k/mcp-grocy-api/compare/v1.0.7...v1.0.8) (2025-05-16)


### Bug Fixes

* correct capability types in server initialization to fix TypeScript errors ([19e6c79](https://github.com/saya6k/mcp-grocy-api/commit/19e6c79a195b5781f87d91ba809d39514553191e))
* update server initialization to strictly follow MCP specification ([e632531](https://github.com/saya6k/mcp-grocy-api/commit/e632531d0bbe470fac319820adf56838be52e1ad))

## [1.0.7](https://github.com/saya6k/mcp-grocy-api/compare/v1.0.6...v1.0.7) (2025-05-16)


### Bug Fixes

* resolve npm packaging and CI/CD issues ([bbeb2e7](https://github.com/saya6k/mcp-grocy-api/commit/bbeb2e73c9f8bbcc2b624b0b9d3a2320ec614ed4))

## [1.0.6](https://github.com/saya6k/mcp-grocy-api/compare/v1.0.5...v1.0.6) (2025-05-16)


### Bug Fixes

* resolve npm package naming error ([d1270e1](https://github.com/saya6k/mcp-grocy-api/commit/d1270e12097621736df1a349789b98ad2e61a95e))
* update SDK version and fix version imports ([e6d6f51](https://github.com/saya6k/mcp-grocy-api/commit/e6d6f5113a159b059244c47630982541e7169b38))

## [1.0.5](https://github.com/saya6k/mcp-grocy-api/compare/v1.0.4...v1.0.5) (2025-05-16)


### Bug Fixes

* removed duplicate case statements for open_product and get_recipe_fulfillment tools ([a745f2d](https://github.com/saya6k/mcp-grocy-api/commit/a745f2d6e3dc5dc8bfcc28c4e9b632f01fc580f8))

## [1.0.4](https://github.com/saya6k/mcp-grocy-api/compare/v1.0.3...v1.0.4) (2025-05-16)


### Bug Fixes

* simplified schema for open_product tool to avoid unsupported anyOf constraint ([d6e65ce](https://github.com/saya6k/mcp-grocy-api/commit/d6e65cecd1c0790121821be97e24350dead924b9))

## [1.0.3](https://github.com/saya6k/mcp-grocy-api/compare/v1.0.2...v1.0.3) (2025-05-16)


### Bug Fixes

* resolved schema validation error in open_product tool ([54f7815](https://github.com/saya6k/mcp-grocy-api/commit/54f7815f0eb6473347b7d1d759ce1dac5148fef5))

## [1.0.2](https://github.com/saya6k/mcp-grocy-api/compare/v1.0.1...v1.0.2) (2025-05-16)


### Bug Fixes

* improve npm publishing configuration ([6bc0a6b](https://github.com/saya6k/mcp-grocy-api/commit/6bc0a6ba260f00bedd122cb88450d33b6a2d3d54))

## [1.0.1](https://github.com/saya6k/mcp-grocy-api/compare/v1.0.0...v1.0.1) (2025-05-16)


### Bug Fixes

* update npm publishing configuration for semantic-release ([f820222](https://github.com/saya6k/mcp-grocy-api/commit/f8202227d5c40eace97f760cdc35396ef20d9be0))

# 1.0.0 (2025-05-16)

Initial Release
