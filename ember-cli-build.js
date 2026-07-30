'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { setConfig } = require('@warp-drive/core/build-config');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },
    babel: {
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
    },
  });

  setConfig(app, __dirname, {
    // this should be the most recent <major>.<minor> version for
    // which all deprecations have been fully resolved
    // and should be updated when that changes
    // compatWith: '5.8', // TODO: uncomment once deprecations are resolved
    deprecations: {
      // ... list individual deprecations that have been resolved here
      DEPRECATE_TRACKING_PACKAGE: false,
    },
  });


  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticEmberSource: true,
    staticInvokables: true,
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
    splitAtRoutes: ['mock-login', 'people', 'organizations', 'sparql'],
  });
};
