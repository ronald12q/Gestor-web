/**
 * PostCSS config: use the new Tailwind PostCSS adapter package.
 * This avoids the runtime error that appears when Tailwind is used directly
 * as a PostCSS plugin (Tailwind v4+ requires the adapter package).
 */
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
