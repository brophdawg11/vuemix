module.exports = {
  extends: ['airbnb', 'plugin:vue/vue3-recommended', 'prettier'],
  plugins: ['cypress'],
  env: {
    'cypress/globals': true,
  },
  rules: {
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    'import/prefer-default-export': 'off',
  },
};
