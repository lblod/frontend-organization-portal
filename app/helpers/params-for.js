import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';

export default class ParamsForHelper extends Helper {
  @service router;
  // Something forces the helper to recompute before it gets destroyed while transitioning out of the route where it's defined
  // which means it sometimes will try to retrieve route params for a page that is no longer active.
  // If that happens, we return the data from the last successful run.
  routeParamsCache = null;

  compute([routeName], { param: paramName }) {
    let routeParams = this.getRouteParams(routeName);

    if (paramName) {
      assert(
        `The "${routeName}" route doesn't have a "${paramName}" param`,
        Boolean(routeParams[paramName])
      );

      return routeParams ? routeParams[paramName] : null;
    } else {
      return routeParams;
    }
  }

  getRouteParams(routeName) {
    let routeInfo = this.router.currentRoute.find((routeInfo) => {
      return routeInfo.name === routeName;
    });

    assert(
      `The "${routeName}" route doesn't exist or isn't currently active`,
      Boolean(routeInfo) || this.routeParamsCache
    );

    if (routeInfo) {
      this.routeParamsCache = routeInfo.params;
    }

    return this.routeParamsCache;
  }

  willDestroy() {
    this.routeParams = null;
  }
}
