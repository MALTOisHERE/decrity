# @trustlayer/shared

Shared TypeScript types, constants, and utilities for TrustLayer packages.

## Usage

```typescript
import {
  ScanRequest,
  ScanResponse,
  User,
  PLATFORMS,
  API_ENDPOINTS,
  hashContent,
  isValidPlatform
} from '@trustlayer/shared'
```

## Contents

### Types

- **Scan types** (`scan.ts`) - Scan requests, responses, verdicts, threat details
- **User types** (`user.ts`) - User accounts, settings, statistics
- **API types** (`api.ts`) - Request/response interfaces for all API endpoints

### Constants

- **Platforms** (`platforms.ts`) - AI platform URLs, patterns, metadata
- **General** (`index.ts`) - API endpoints, thresholds, cache config, storage keys

### Utils

- **Hash** (`hash.ts`) - Content hashing for deduplication
- **Validation** (`validation.ts`) - Type guards and content validators

## Building

```bash
pnpm build
```

## Development

```bash
pnpm dev
```
