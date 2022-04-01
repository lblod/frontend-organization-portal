'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },
    sassOptions: {
      sourceMapEmbed: true,
      includePaths: [
        'node_modules/@appuniversum/appuniversum',
        'node_modules/@appuniversum/ember-appuniversum/app/styles',
      ],
    },
    autoprefixer: {
      enabled: true,
      cascade: true,
      sourcemap: true,
    },
    babel: {
      plugins: [require.resolve('ember-auto-import/babel-plugin')],
    },
    // Disable chunk css fingerprinting until the config is included in ember-auto-import: https://github.com/ef4/ember-auto-import/pull/496
    fingerprint: {
      exclude: ['assets/chunk.*.css'],
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  return app.toTree();
};
