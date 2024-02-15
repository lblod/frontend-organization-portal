'use strict';

module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-prettier/recommended'],
  rules: {
    'selector-class-pattern': null, // This enforces kebab-case but we use BEM which isn't compatible with this rule
    'no-descending-specificity': null, // To be removed once we have fixed all the issues
    'scss/at-extend-no-missing-placeholder': null, // To be removed once we have fixed all the issues
  },
};
