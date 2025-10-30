export function showErrorPage(transition, routerService) {
  const path = routeInfoUrl(transition.to, routerService);
  routerService.transitionTo('error', {
    // We need to remove any leading / because the history API throws an error when a path contains double leading slashes and the history location doesn't seem to deal with that.
    path: removeLeadingSlash(path),
  });
}

// This converts a RouteInfo instance to the corresponding url by collecting all
// the route params and query params and using the router.urlFor method.
// This is a public API reimplementation of the `transition.intent.url` property.
// More info: https://discord.com/channels/480462759797063690/624403666585124895/897832626616926218
function routeInfoUrl(routeInfo, routerService) {
  let targetRoute = routeInfo.name;
  let allRouteParamValues = [];
  let allRouteQueryParams = {};

  routeInfo.find((routeInfo) => {
    routeInfo.paramNames.forEach((paramName) => {
      let paramValue = routeInfo.params[paramName];
      allRouteParamValues.push(paramValue);
      allRouteQueryParams = {
        ...allRouteQueryParams,
        ...routeInfo.queryParams,
      };
    });
  });

  return routerService.urlFor(targetRoute, ...allRouteParamValues, {
    queryParams: allRouteQueryParams,
  });
}

function removeLeadingSlash(str) {
  if (str.startsWith('/')) {
    return str.slice(1);
  }

  return str;
}
