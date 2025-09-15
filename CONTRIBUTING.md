# Contributing to XRPH Wallet

Thank you for your interest in contributing to XRPH Wallet! This document provides guidelines and instructions for contributing to our open-source XRPL wallet project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Issue Reporting](#issue-reporting)
- [Development Guidelines](#development-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct. Please be respectful, inclusive, and constructive in all interactions.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version recommended)
- **Yarn** package manager
- **Java 17** and Android SDK (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Git** for version control

### Fork and Clone

1. **Fork the repository** on GitHub by clicking the "Fork" button
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/XRPH-Mobile-Wallet.git
   cd XRPH-Mobile-Wallet
   ```
3. **Add upstream remote** to stay updated with the main repository:
   ```bash
   git remote add upstream https://github.com/XRPHealthcare/XRPH-Mobile-Wallet.git
   ```

## Development Setup

### Environment Configuration

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your .env file** with appropriate values:
   ```env
   XRPL_ENDPOINT=wss://your-xrpl-endpoint
   XRPH_ISSUER_ADDRESS=rXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   RLUSD_ISSUER_ADDRESS=rXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   DEFAULT_ASSETS=XRP,XRPH,RLUSD
   MEMO_PREFIX=REF:
   ```

### Install Dependencies

```bash
yarn install
```

### Run the Application

**For iOS:**
```bash
yarn ios
```

**For Android:**
```bash
yarn android
```

## Contributing Process

### 1. Create a Branch

Create a new branch for your feature or bugfix:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
```

### 2. Make Your Changes

- Write clean, readable, and maintainable code
- Follow the existing code style and patterns
- Add comments for complex logic to help future developers
- Ensure your changes don't break existing functionality

### 3. Test Your Changes

- Test on both iOS and Android platforms when possible
- Verify that existing features still work
- Test edge cases and error scenarios

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add new payment confirmation screen"
# or
git commit -m "fix: resolve trustline creation issue"
```

**Commit Message Format:**
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear title and description
- Reference any related issues
- Include screenshots for UI changes
- Describe testing performed

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] Changes are tested on both platforms (iOS/Android)
- [ ] No console errors or warnings
- [ ] Documentation updated if needed
- [ ] Commit messages are clear and descriptive

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Manual testing performed
- [ ] No regressions introduced

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Fixes #(issue number)
```

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Description:** Clear description of the issue
- **Steps to reproduce:** Detailed steps to reproduce the bug
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happens
- **Environment:** Device, OS version, app version
- **Screenshots:** If applicable

### Feature Requests

For feature requests, please include:

- **Description:** Clear description of the proposed feature
- **Use case:** Why this feature would be valuable
- **Proposed solution:** How you envision it working
- **Alternatives:** Other solutions you've considered

## Development Guidelines

### Code Style

- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Keep functions focused and single-purpose
- Add comments for complex business logic
- Maintain consistent indentation and formatting

### File Organization

- Place components in appropriate folders under `Screens/`
- Keep handlers in separate `Handlers/` folders
- Use descriptive file names
- Group related functionality together

### XRPL Integration

- Follow XRPL best practices for transaction handling
- Implement proper error handling for network operations
- Use appropriate transaction types and parameters
- Handle edge cases like network failures gracefully

### Security Considerations

- Never commit sensitive data (keys, passwords, etc.)
- Validate all user inputs
- Use secure storage for sensitive information
- Follow mobile security best practices

## Testing

### Manual Testing

- Test on different device sizes and orientations
- Test with various network conditions
- Test edge cases and error scenarios
- Verify accessibility features work correctly

### Automated Testing

- Write unit tests for utility functions
- Add integration tests for critical flows
- Test API interactions and error handling

## Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document API endpoints and their usage
- Include examples for reusable components
- Update README when adding new features

### User Documentation

- Update user-facing documentation for new features
- Provide clear setup instructions
- Include troubleshooting guides
- Document known limitations

## Getting Help

- **GitHub Issues:** Use issues for bug reports and feature requests
- **Discussions:** Use GitHub Discussions for questions and ideas

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Community acknowledgments

Thank you for contributing to XRPH Wallet! Your efforts help make XRPL more accessible to users worldwide.

---

**Questions?** Feel free to open a GitHub issue or reach out to the maintainers.
