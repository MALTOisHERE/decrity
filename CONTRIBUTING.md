# Contributing to Decrity

## Development Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/MALTOisHERE/Decrity.git
   cd Decrity
   pnpm install
   ```

2. **Start infrastructure**
   ```bash
   docker-compose up -d
   ```

3. **Set up database**
   ```bash
   cd packages/api
   pnpm db:migrate
   pnpm db:generate
   ```

4. **Start development servers**
   ```bash
   pnpm dev  # Starts all TypeScript packages
   ```

## Project Structure

- **`packages/shared/`** - Shared TypeScript types and utilities
  - Used by extension, api, and dashboard
  - Build first if making changes

- **`packages/extension/`** - Chrome extension (the core product)
  - Background service worker
  - Content scripts for each AI platform
  - React popup UI

- **`packages/api/`** - Node.js/Fastify REST API
  - Scan endpoint orchestration
  - Database persistence (Prisma)
  - ML service client

- **`packages/ml-service/`** - Python/FastAPI ML classifier
  - Heuristic detection (Layer 1)
  - ML classification (Layer 2)

- **`packages/dashboard/`** - React web dashboard
  - Threat history
  - User statistics

## Code Guidelines

### TypeScript/JavaScript

- Use TypeScript strict mode
- Import types from `@decrity/shared`
- Run `pnpm lint` before committing
- Run `pnpm format` to auto-fix formatting

### Python

- Follow PEP 8
- Use type hints
- Run tests before committing (when available)

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Run linting: `pnpm lint`
4. Commit with clear messages
5. Push and create PR

### Commit Messages

Follow conventional commits:
- `feat: add new feature`
- `fix: fix bug`
- `docs: update documentation`
- `refactor: refactor code`
- `test: add tests`
- `chore: maintenance tasks`

## Testing

```bash
# Run tests (when implemented)
pnpm test

# Test specific package
pnpm --filter @decrity/extension test
```

## Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @decrity/extension build
```

## Important Notes

### Security & Privacy

- **Never store actual content** - only hashes and metadata
- **Privacy mode is first-class** - must work without API calls
- **Plain language in UI** - avoid technical jargon
- Review Section 10 of DOC.md before any data handling changes

### Extension Development

- Platform selectors are fragile - AI platforms change their DOM frequently
- Test on all 4 platforms (ChatGPT, Gemini, Claude, Copilot) before shipping
- Layer 1 heuristics must work offline

### API Development

- All endpoints require JWT auth (except /health)
- Content payloads must never be persisted
- Rate limiting is enforced

## Resources

- [DOC.md](./DOC.md) - Full project documentation
- [Turbo Docs](https://turbo.build/repo/docs) - Monorepo tooling
- [Prisma Docs](https://www.prisma.io/docs) - Database ORM
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/mv3/) - Manifest V3
