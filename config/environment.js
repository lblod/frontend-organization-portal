'use strict';

module.exports = function (environment) {
  let ENV = {
    appName: 'Organisatieportaal',
    contactEmail: 'organisaties.abb@vlaanderen.be',
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
    torii: {
      disableRedirectInitializer: true,
      providers: {
        'acmidm-oauth2': {
          apiKey: '677af572-2e2f-4e61-ad38-036723bb314c',
          baseUrl: 'https://authenticatie-ti.vlaanderen.be/op/v1/auth',
          scope: 'openid vo profile abb_organisatieportaal',
          redirectUri:
            'https://organisaties.abb.lblod.info/authorization/callback',
          switchUrl: 'https://organisaties.abb.lblod.info/switch-login',
          logoutUrl: 'https://authenticatie-ti.vlaanderen.be/op/v1/logout',
        },
      },
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

  if (process.env.DEPLOY_ENV === 'production') {
    // TODO set the proper value for production
    // ENV['torii']['providers']['acmidm-oauth2']['apiKey'] = '';
    // ENV['torii']['providers']['acmidm-oauth2']['baseUrl'] = 'https://authenticatie.vlaanderen.be/op/v1/auth';
    // ENV['torii']['providers']['acmidm-oauth2']['switchUrl'] = '';
    // ENV['torii']['providers']['acmidm-oauth2']['redirectUri'] = '';
    //  ENV['torii']['providers']['acmidm-oauth2']['logoutUrl'] = 'https://authenticatie.vlaanderen.be/op/v1/logout';
  }

  return ENV;
};
