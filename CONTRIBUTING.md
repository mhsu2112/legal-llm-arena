# Contributing to Legal LLM Arena

Thank you for your interest in contributing to Legal LLM Arena! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists in the GitHub Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Your environment (OS, Node version, etc.)

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend
   npm run build
   npm run dev

   # Frontend tests
   cd frontend
   npm run build
   npm run dev
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add feature: description of your changes"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Wait for review and address feedback

## Development Setup

See the main README.md for detailed setup instructions.

## Code Style Guidelines

### TypeScript
- Use TypeScript strict mode
- Define explicit types (avoid `any` when possible)
- Use interfaces for object shapes
- Follow existing naming conventions

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

### Backend Code
- Use async/await instead of callbacks
- Handle errors gracefully
- Add logging for important operations
- Validate inputs with Zod schemas

## Areas for Contribution

### High Priority
- Add more LLM providers (Llama, Mistral, etc.)
- Improve error handling and user feedback
- Add unit and integration tests
- Performance optimizations

### Documentation
- Tutorial videos or guides
- API documentation improvements
- Code comments for complex logic
- Example questions for different domains

### Features
- User authentication and profiles
- Question difficulty rating system
- Export functionality for results
- Citation verification
- Batch evaluation mode

### Legal Content
- Add more diverse legal questions
- Expand taxonomy coverage
- Create domain-specific evaluation criteria
- Add jurisdiction-specific questions

## Questions?

Feel free to open an issue with the "question" label if you need clarification on anything.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the problem, not the person
- Help others learn and grow

Thank you for contributing to Legal LLM Arena! 🎉
