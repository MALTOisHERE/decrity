# @decrity/shared

Shared TypeScript types, constants, and utilities used across Decrity's packages.

## Usage

```typescript
import {
  ScanRequest,
  ScanResponse,
  User,
  PLATFORMS,
  API_ENDPOINTS,
  hashContent,
  isValidPlatform,
} from '@decrity/shared'
```

## Contents

### Types

- **Scan types** (`scan.ts`): scan requests, responses, verdicts, threat details
- **User types** (`user.ts`): user accounts, settings, statistics
- **API types** (`api.ts`): request/response interfaces for every API endpoint

### Constants

- **Platforms** (`platforms.ts`): AI platform URLs and URL-matching patterns
- **General** (`index.ts`): API endpoints, threat thresholds, cache config, badge colors, storage keys, rate limits

### Utils

- **Hash** (`hash.ts`): content hashing for deduplication
- **Validation** (`validation.ts`): type guards and content validators

## Development

```bash
pnpm --filter @decrity/shared build
pnpm --filter @decrity/shared dev     # watch mode
```

If you're changing a type or constant used by other packages, build this package first; see the root [CLAUDE.md](../../CLAUDE.md)'s "Build Order" note.
