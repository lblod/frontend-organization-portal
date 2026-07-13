/**
 * Type declarations for
 *    import config from 'frontend-organization-portal/config/environment'
 */
declare const config: {
  environment: string;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: 'history' | 'hash' | 'none';
  rootURL: string;
  APP: Record<string, unknown>;
  announce: {
    maintenance: {
      enabled: string;
      message: string;
    };
    newDeployment: {
      enabled: string;
      message: string;
    };
    testing: {
      enabled: string;
      message: string;
    };
  };
  appName: string;
  contactEmail: string;
  environmentName: string;
  acmidm: {
    clientId: string;
    scope: string;
    authUrl: string;
    logoutUrl: string;
    authRedirectUrl: string;
    switchRedirectUrl: string;
  };
  showAppVersionHash: boolean;
  uriInfoServiceUrl: string;
  userManual: {
    general: string;
    module: {
      organizations: string;
      people: string;
    };
  };
  features: Record<string, string>;
};

export default config;
