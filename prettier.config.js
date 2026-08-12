/** @type {import('prettier').Config} */
const config = {
  // Standard formatting options
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'es5',
  tabWidth: 2,
  printWidth: 80,
  arrowParens: 'always',

  // Plugin for Tailwind CSS class sorting
  plugins: ['prettier-plugin-tailwindcss'],
};

module.exports = config;