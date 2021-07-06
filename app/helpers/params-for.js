import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';

export default class ParamsForHelper extends Helper {
  @service router;

  compute([routeName], { param: paramName }) {
    let routeParams = this.getRouteParams(routeName);

    if (paramName) {
      assert(
        `The "${routeName}" route doesn't have a "${paramName}" param`,
        Boolean(routeParams[paramName])
      );

      return routeParams[paramName];
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
      Boolean(routeInfo)
    );

    return routeInfo.params;
  }
}
