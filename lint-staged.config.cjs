const lintAndFormat = [
  'eslint --fix --cache --flag v10_config_lookup_from_file --no-warn-ignored',
  'prettier --write',
];

module.exports = {
  '{apps,packages}/**/*.{ts,tsx,js,jsx}': lintAndFormat,
};
