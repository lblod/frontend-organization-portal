import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const EDITOR_ROLES = [
  'ABBOrganisatiePortaalGebruiker-editeerder',
  'ABBOrganisatiePortaalGebruiker-beheerder',
];

const READER_ROLES = ['ABBOrganisatiePortaalGebruiker-lezer'];

export default class CurrentSessionService extends Service {
  @service router;
  @service session;
  @service store;

  @tracked account;
  @tracked user;
  @tracked group;
  @tracked roles;

  get canEdit() {
    return this.roles.some((role) => EDITOR_ROLES.includes(role));
  }

  get canOnlyRead() {
    return (
      !this.canEdit && this.roles.some((role) => READER_ROLES.includes(role))
    );
  }

  async load() {
    if (this.session.isAuthenticated) {
      let sessionData = this.session.data.authenticated.relationships;
      this.roles = this.session.data.authenticated.data?.attributes?.roles;
      let accountId = sessionData.account.data.id;

      this.account = await this.store.findRecord('account', accountId, {
        include: 'user',
      });
      this.user = this.account.user;

      // TODO no group / roles for now. not defined for acm idm, thus break the app when using acm idm login
      //let groupId = sessionData?.group?.data?.id;
      //this.group = await this.store.findRecord('group', groupId);
    }
  }

  /**
   * Checks if the user has edit permissions and if they do not,
   * transition to the 'route-not-found' page while keeping the
   * same url as the target route.
   *
   * @param {Transition} transition
   * @returns {boolean} true if the user has edit permissions, false otherwise
   */
  requireEditPermissions(transition) {
    if (this.canEdit) {
      return true;
    }

    this.router.replaceWith('route-not-found', {
      wildcard: generateWildcardUrl(transition, this.router),
    });

    return false;
  }
}

/**
 * Generate a url for the destination route without the leading slash so that it can be passed into the wildcard.
 * Ideally this url would be provided by the transition object but that isn't the case at the moment.
 * `transition.intent.url` does exist but that is considered private API.
 *
 * Discord discussion about a potential RFC: https://discord.com/channels/480462759797063690/624403666585124895/897832626616926218
 *
 * @param {Transition} transition
 * @param {RouterService} routerService
 * @returns {string} url without a leading slash `/` so that it can be passed into the wildcard directly.
 */
function generateWildcardUrl(transition, routerService) {
  let targetRoute = transition.to.name;
  let allRouteParamValues = [];
  let allRouteQueryParams = {};

  transition.to.find((routeInfo) => {
    routeInfo.paramNames.forEach((paramName) => {
      let paramValue = routeInfo.params[paramName];
      allRouteParamValues.push(paramValue);
      allRouteQueryParams = {
        ...allRouteQueryParams,
        ...routeInfo.queryParams,
      };
    });
  });

  let generatedUrl = routerService.urlFor(targetRoute, ...allRouteParamValues, {
    queryParams: allRouteQueryParams,
  });

  if (generatedUrl.startsWith('/')) {
    generatedUrl = generatedUrl.slice(1);
  }

  return generatedUrl;
}
