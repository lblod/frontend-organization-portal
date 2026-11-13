import Service, { service } from '@ember/service';

/**
 * Whether the current user can edit the organisation data, or only read it.
 *
 * `isReadOnly` is true when the `disable-rvs-organizations-edits` flag makes
 * the data read-only for the current user. RVS (the Lokale Verkenner) owns the
 * data of the non-worship organisations and their sub-resources (governing
 * bodies, sites, change events, memberships) once the flag is on, so only users
 * without a worship role are affected; worship users keep their edits. Users
 * who can only read see their usual read view, not the notice.
 *
 * The routes and templates both read the flag through this service, so a page
 * can never disagree with the route that guards it.
 */
export default class RvsOrganizationEditsService extends Service {
  @service features;
  @service currentSession;

  get isReadOnly() {
    return (
      this.features.isEnabled('disable-rvs-organizations-edits') &&
      !this.currentSession.hasWorshipRole &&
      this.currentSession.canEdit
    );
  }
}
