'use strict';

module.exports = function (environment) {
  let ENV = {
    appName: 'Organisatieportaal',
    contactEmail: 'organisaties.abb@vlaanderen.be',
    fastboot: {
      hostWhitelist: [/^localhost:\d+$/],
    },
    metis: {
      baseUrl: 'EMBER_METIS_BASE_URL',
    },
    yasgui: {
      // NOTE: look at app/modifiers/yasgui.js when changing this variable
      defaultQuery: 'EMBER_YASGUI_DEFAULT_QUERY',
      extraPrefixes: 'EMBER_YASGUI_EXTRA_PREFIXES',
    },
    modulePrefix: 'frontend-contact-hub',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: false,
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
