# Contributing to Z2B Platform

First off, thank you for considering contributing to Z2B! It's people like you that make Z2B such a great platform.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title** for the issue
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed and what behavior you expected**
* **Include screenshots and animated GIFs if possible**
* **Include your environment details** (OS, Node version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain the expected behavior**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the JavaScript/React/Node.js styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code based on the Documentation Styleguide
* End all files with a newline

## Development Process

### Setting Up Your Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/Z2B.git
   cd Z2B
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/Zero2Billionaires/Z2B.git
   ```
4. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```
5. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. **Make your changes** in your feature branch
2. **Add tests** for your changes
3. **Run tests** to ensure everything passes:
   ```bash
   npm test
   ```
4. **Run linting**:
   ```bash
   npm run lint
   ```
5. **Commit your changes** using conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat:` A new feature
* `fix:` A bug fix
* `docs:` Documentation only changes
* `style:` Changes that don't affect code meaning (white-space, formatting)
* `refactor:` Code change that neither fixes a bug nor adds a feature
* `perf:` Code change that improves performance
* `test:` Adding missing tests or correcting existing tests
* `chore:` Changes to the build process or auxiliary tools

Examples:
```
feat: add user authentication system
fix: resolve commission calculation error
docs: update API documentation
style: format code with prettier
refactor: simplify MLM calculator logic
perf: optimize database queries
test: add unit tests for tier system
chore: update dependencies
```

## Styleguides

### JavaScript/React Styleguide

* Use ES6+ features
* Use functional components with hooks for React
* Use meaningful variable and function names
* Add comments for complex logic
* Follow ESLint configuration
* Use Prettier for formatting

Example:
```javascript
// Good
const calculateCommission = (amount, rate) => {
  return amount * rate;
};

// Bad
const calc = (a, r) => a * r;
```

### PHP Styleguide

* Follow PSR-12 coding standard
* Use meaningful variable and function names
* Add PHPDoc comments for functions
* Use type declarations

Example:
```php
/**
 * Calculate MLM commission
 *
 * @param float $amount The sale amount
 * @param float $rate The commission rate
 * @return float The calculated commission
 */
function calculateCommission(float $amount, float $rate): float {
    return $amount * $rate;
}
```

### Documentation Styleguide

* Use Markdown for documentation
* Use clear and concise language
* Include code examples where appropriate
* Keep README.md up to date

## Project Structure

```
Z2B/
├── client/          # React frontend
├── server/          # Node.js backend
├── Z2B-v21/         # PHP legacy app & marketplace
├── docs/            # Documentation
├── .github/         # GitHub configuration
└── tests/           # Test files
```

## Testing

* Write unit tests for new features
* Write integration tests for API endpoints
* Aim for high test coverage
* Run tests before committing:
  ```bash
  npm test
  npm run test:coverage
  ```

## Database Changes

If your changes require database schema modifications:

1. Create a migration script in `server/migrations/` or `Z2B-v21/database/migrations/`
2. Document the changes in your PR
3. Ensure backward compatibility where possible

## API Changes

If you're adding or modifying API endpoints:

1. Update API documentation in `docs/API.md`
2. Follow RESTful conventions
3. Add appropriate error handling
4. Include validation for all inputs
5. Write integration tests

## Security

* Never commit sensitive information (API keys, passwords, etc.)
* Use environment variables for configuration
* Follow OWASP security guidelines
* Report security vulnerabilities privately to maintainers

## Getting Help

* Check the [documentation](../README.md)
* Search [existing issues](https://github.com/Zero2Billionaires/Z2B/issues)
* Join our community discussions
* Reach out to maintainers

## Recognition

Contributors will be recognized in:
* README.md contributors section
* Release notes
* Project website (coming soon)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Z2B!**
