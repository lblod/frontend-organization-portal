/* eslint-disable ember/no-private-routing-service */

// Source: https://gist.github.com/evoactivity/39fd9061a1a560b744112b6812294031
/* Based on https://github.com/raido/ember-refined-route-substate-url */
import config from 'frontend-organization-portal/config/environment';
import { debug } from '@ember/debug';
import HistoryLocation from '@ember/routing/history-location';
import { service } from '@ember/service';

const SUBSTATE_ROUTE_SUFFIX = {
  LOADING: 'loading',
  ERROR: 'error',
};

const LOG_TAG = '[RouterTransitionAnalyzer]';
const LOG_TRANSITIONS =
  config.APP.LOG_TRANSITIONS || config.APP.LOG_TRANSITIONS_INTERNAL || false;

export default class OptimisticHistoryLocation extends HistoryLocation {
  @service router;

  constructor(...args) {
    super(...args);
    this.onShouldUpdateURL(this.shouldUpdateURL);
    this.router.on('routeWillChange', this.routeWillChangeHandler);
    this.router.on('routeDidChange', this.routeDidChangeHandler);
  }

  get historyStateKey() {
    return 'history_location_update_url_eagerly_to_destination_route';
  }

  onShouldUpdateURL(callbackToAdd) {
    this.shouldUpdateURLCallbacks.push(callbackToAdd);
  }

  offShouldUpdateURL(callbackToRemove) {
    this.shouldUpdateURLCallbacks = this.shouldUpdateURLCallbacks.filter(
      (cb) => {
        return cb !== callbackToRemove;
      },
    );
  }

  setURL(path) {
    if (
      this.history.state &&
      this.history.state[this.historyStateKey] === true
    ) {
      super.replaceURL(path);
      return;
    }
    super.setURL(path);
  }

  formatURL(originalUrl) {
    const url = super.formatURL(originalUrl);

    if (url.includes('#')) {
      return url.replace(/([^/])#(.*)/, '$1/#$2');
    }

    if (url.includes('?')) {
      return url.replace(/([^/])\?(.*)/, '$1/?$2');
    }

    return url.replace(/\/?$/, '/');
  }

  shouldUpdateURL = (path) => {
    if (this.getURL() === path) {
      return;
    }
    this.router._router._routerMicrolib.updateURL(path);
  };

  shouldUpdateURLCallbacks = [];
  transitionQueue = [];

  routeWillChangeHandler = (transition) => {
    if (!this.hasRouteInfoForAnalysis(transition)) {
      return;
    }
    if (LOG_TRANSITIONS)
      debug(`${LOG_TAG}: routeWillChange -> ${transition.to.name}`);
    this.transitionQueue.push(transition);

    const newUrl = this.determineUrlForDestinationRoute(transition);
    if (newUrl) {
      if (LOG_TRANSITIONS)
        debug(`${LOG_TAG}: shouldUpdateCallback -> ${newUrl}`);
      this.shouldUpdateURLCallbacks.forEach((cb) => {
        cb(newUrl);
      });
    }
  };

  routeDidChangeHandler = (transition) => {
    this.transitionQueue = [];

    if (!this.hasRouteInfoForAnalysis(transition)) {
      return;
    }
    if (LOG_TRANSITIONS)
      debug(`${LOG_TAG}: routeDidChange -> ${transition.to.name}`);
  };

  determineUrlForDestinationRoute(transition) {
    if (!this.isIntermediateRoute(transition)) {
      return null;
    }

    // These fail-safes here should never be triggered but just to be double sure that our queue is not messed up.
    // We have those sanity checks to avoid possible TypeErrors.
    const substateTransitionIndexInQueue =
      this.transitionQueue.indexOf(transition);
    if (substateTransitionIndexInQueue <= 0) {
      return null;
    }
    const routeBeforeIntermediateRoute =
      this.transitionQueue[substateTransitionIndexInQueue - 1];
    if (!routeBeforeIntermediateRoute) {
      return null;
    }

    // Transition queue can include: "my.route, my.route.loading, my.route.error" transitions
    // Since for the first "my.route.loading" route we already triggered shouldUpdateUrlCallbacks
    // We bail out for error route ones, this avoids updating url to "my/route/loading".
    if (this.isIntermediateRoute(routeBeforeIntermediateRoute)) {
      return null;
    }
    const params = this.findAllRouteParamsForUrlLookup(
      routeBeforeIntermediateRoute,
    );
    const { queryParams } = transition.to;
    let url = this.router.urlFor.apply(this.router, [
      routeBeforeIntermediateRoute.to.name,
      ...params,
      { queryParams },
    ]);
    url = url.replace(config.rootURL, '/');
    return url;
  }

  // We need to collect all parent routes params, like
  // /route1/:id/route2/:id
  // So we can call router.urlFor() to give us new destination route URL which we can push
  findAllRouteParamsForUrlLookup(transition) {
    let route = transition.to;
    const params = [];
    const finalParams = [];
    if (route) {
      const keys = Object.keys(route.params);
      if (keys.length > 0) {
        params.push(route.params);
      }
      route = route.parent;
    }
    params.map((obj) => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] !== 'undefined') {
          finalParams.push(obj[key]);
        }
      });
    });

    finalParams.reverse();
    return finalParams;
  }

  isIntermediateRoute(transition) {
    const routeName = transition.to.name;
    return (
      routeName.endsWith(SUBSTATE_ROUTE_SUFFIX.LOADING) ||
      routeName.endsWith(SUBSTATE_ROUTE_SUFFIX.ERROR)
    );
  }

  hasRouteInfoForAnalysis(transition) {
    return !!transition.to;
  }
}
