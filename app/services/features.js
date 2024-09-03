import Service from '@ember/service';
import { assert } from '@ember/debug';
import config from 'frontend-organization-portal/config/environment';

export default class FeaturesService extends Service {
  static PREFIX = 'feature-';
  #features = {};

  constructor() {
    super();
    const queryParams = this.#getQueryParams();
    if (queryParams.get('clear-feature-overrides') === 'true') {
      this.#clearCookieFeatures();
    }

    const configFeatures = this.#getConfigFeatures();
    const cookieFeatures = this.#getCookieFeatures();
    const queryFeatures = this.#getQueryParamsFeatures(queryParams);
    this.setup({
      ...configFeatures,
      ...cookieFeatures,
      ...queryFeatures,
    });

    // save query params in cookie
    if (Object.keys(queryFeatures).length > 0) {
      this.#setCookieFeatures(queryFeatures);
    }
  }

  setup(features) {
    this.#features = { ...features };
    console.log('Feature flags:', this.#features);
  }

  isEnabled(feature) {
    assert(
      `The "${feature}" feature is not defined. Make sure the feature is defined in the "features" object in the config/environment.js file and that there are no typos in the name.`,
      feature in this.#features,
    );

    return this.#features[feature] ?? false;
  }

  #getConfigFeatures() {
    const configFeatures = Object.fromEntries(
      Object.entries(config.features).map(([featureName, value]) => {
        return [featureName, value === 'true' || value === true];
      }),
    );

    return configFeatures;
  }

  // cookie has to start with 'feature-{{feature-name}}'
  #getCookieFeatures() {
    const cookieFeatures = {};
    const cookies = document.cookie.split('; ');

    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      const featureName = this.#extractFeatureNameFromKey(key);
      if (featureName) {
        cookieFeatures[featureName] = value === 'true';
      }
    }

    return cookieFeatures;
  }

  #setCookieFeatures(features) {
    for (const [featureName, featureValue] of Object.entries(features)) {
      document.cookie = `${FeaturesService.PREFIX}${featureName}=${featureValue}; path=/`;
    }
  }

  #clearCookieFeatures() {
    const featuresToClear = Object.keys(this.#getCookieFeatures());
    for (const featureName of featuresToClear) {
      document.cookie = `${FeaturesService.PREFIX}${featureName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }

  #getQueryParams() {
    const queryString = window.location.search.substring(1);
    return new URLSearchParams(queryString);
  }

  //query param has to start with 'feature-{{feature-name}}'
  #getQueryParamsFeatures(queryParams) {
    const queryFeatures = {};

    for (const [key, value] of queryParams.entries()) {
      const featureName = this.#extractFeatureNameFromKey(key);
      if (featureName) {
        queryFeatures[featureName] = value === 'true';
      }
    }

    return queryFeatures;
  }

  #extractFeatureNameFromKey(key) {
    if (key?.startsWith(FeaturesService.PREFIX)) {
      return key.replace(FeaturesService.PREFIX, '');
    }
    return null;
  }
}
