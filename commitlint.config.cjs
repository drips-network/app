module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    "header-max-length": [1, "always", 100],
    "body-max-length": [1, "always", 100],
    "body-max-line-length": [1, "always", 100],
  },
};
