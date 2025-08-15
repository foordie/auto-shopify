module.exports = {
  // TypeScript and JavaScript files
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // JSON files
  '*.json': ['prettier --write'],

  // CSS and SCSS files
  '*.{css,scss}': ['prettier --write'],

  // Markdown files
  '*.md': ['prettier --write'],

  // Validate TypeScript files specifically
  '*.{ts,tsx}': [() => 'npm run type-check'],
};
