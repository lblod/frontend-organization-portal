import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import administrativeUnitValidations from 'frontend-organization-portal/validations/administrative-unit';
import { dropTask } from 'ember-concurrency';
import { A } from '@ember/array';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsEditRoute extends Route {
  @service currentSession;
  @service router;

  queryParams = {
    sort: { refreshModel: true },
  };

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model(params) {
    let administrativeUnit = await this.modelFor(
      'administrative-units.administrative-unit.related-organizations'
    );

    let relatedMemberships = A();

    // TODO is membershipsAsMemberOf a nonsense for my task ? I think so, when I compare to
    // https://github.com/lblod/frontend-organization-portal/blob/development/app/routes/administrative-units/administrative-unit/related-organizations/edit.js

    const membershipsAsMemberOf =
      await administrativeUnit.membershipsOfOrganization;

    let membershipHasRelationWith = null;
    if (membershipsAsMemberOf.length) {
      for (const membership of membershipsAsMemberOf.toArray()) {
        const role = await membership.role;
        if (role.hasRelationWith && !membershipHasRelationWith) {
          membershipHasRelationWith = membership;
        }
        if (role.participatesIn) {
          relatedMemberships.push(membership);
        }
      }
    }

    if (!membershipHasRelationWith) {
      membershipHasRelationWith = this.store.createRecord('membership');
      membershipHasRelationWith.member = administrativeUnit;
    }

    const membershipsAsOrganization =
      await this.loadMembershipsAsOrganizationTask.perform(
        administrativeUnit.id,
        params
      );

    relatedMemberships.push(...membershipsAsOrganization.toArray());

    const membershipRoles = await this.store.query('membership-role', {
      'filter[has-broader-role][:id:]': '93c48754610c45e6bd9a894d2720a53d',
    });

    return {
      administrativeUnit: createValidatedChangeset(
        administrativeUnit,
        administrativeUnitValidations
      ),
      membershipHasRelationWith,
      relatedMemberships,
      membershipRoles,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadMembershipsAsOrganizationTask(id) {
    return yield this.store.query('membership', {
      'filter[:or:][organization][:id:]': id,
      include: 'organization,member',
      'page[size]': 500,
    });
    // TODO add sorting and pagination
  }
}
