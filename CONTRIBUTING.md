# Contributing to The Constable

Thank you for your interest in contributing! This document provides guidelines for contributing to The Constable project.

## Development Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **Rust** >= 1.70.0 (for Anchor programs)
- **Solana CLI** >= 1.17.0
- **Anchor CLI** >= 0.29.0

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd constable-check

# Install dependencies and build workspace
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Build Anchor programs
cd anchor
anchor build
```

### Running Locally

```bash
# Start local validator, API, and frontend
npm run dev

# Or run components separately:
npm run dev -w api       # API only
npm run dev -w frontend  # Frontend only
npm run anchor:localnet  # Local validator only
```

## Project Structure

```
constable-check/
├── anchor/          # Solana smart contracts (Anchor/Rust)
├── api/             # Express REST API (TypeScript)
├── sdk/             # TypeScript SDK
├── frontend/        # Next.js frontend
└── docs/            # Documentation
```

## Branch Naming Conventions

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/improvements

Example: `feature/evidence-vault-indexing`

## Pull Request Requirements

1. **Title**: Clear, descriptive summary of changes
2. **Description**: Include:
   - What changed and why
   - Related issue numbers
   - Testing performed
   - Screenshots (for UI changes)

3. **Checklist**:
   - [ ] Code follows project style guidelines
   - [ ] Tests pass (`npm test`)
   - [ ] Linting passes (`npm run lint`)
   - [ ] Anchor programs build (`npm run anchor:build`)
   - [ ] Documentation updated (if needed)

## Testing Guidelines

### Unit Tests

```bash
# Run SDK tests
npm test -w sdk

# Run Anchor tests
npm run anchor:test
```

### Integration Testing

```bash
# Start local validator
npm run anchor:localnet

# Run full test suite
npm test
```

### Test Coverage

- Aim for >80% coverage on new code
- Include edge cases and error scenarios
- Test both success and failure paths

## Code Style

### TypeScript/JavaScript

- Use strict TypeScript configuration
- Prefer `const` and `let` over `var`
- Use async/await for asynchronous operations
- Follow ESLint configuration

### Rust (Anchor)

- Follow Rust naming conventions
- Document all public functions
- Include error handling for all CPI calls
- Use meaningful variable names

## Commit Messages

Format: `<type>(<scope>): <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

Examples:
- `feat(api): add cluster analysis endpoint`
- `fix(sdk): resolve PDA derivation bug`
- `docs(readme): update quick start instructions`

## Security

- Never commit private keys or `.env` files
- Use environment variables for sensitive configuration
- Report security vulnerabilities privately to maintainers

## Questions?

Open an issue or reach out to the maintainers. We're here to help!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.