import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import { getAddressValidations } from 'frontend-organization-portal/validations/address';
import contactValidations from 'frontend-organization-portal/validations/contact-point';
import worshipAdministrativeUnitValidations from 'frontend-organization-portal/validations/worship-administrative-unit';
import administrativeUnitValidations, {
  getStructuredIdentifierKBOValidations,
} from 'frontend-organization-portal/validations/administrative-unit';
import secondaryContactValidations from 'frontend-organization-portal/validations/secondary-contact-point';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsNewRoute extends Route {
  @service store;
  @service currentSession;
  @service router;

  queryParams = {
    classificationId: { refreshModel: true, replace: true },
  };

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model(params) {
    let administrativeUnit;
    if (
      params.classificationId == CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    ) {
      administrativeUnit = createValidatedChangeset(
        this.store.createRecord('central-worship-service'),
        worshipAdministrativeUnitValidations
      );
    } else if (params.classificationId == CLASSIFICATION_CODE.WORSHIP_SERVICE) {
      administrativeUnit = createValidatedChangeset(
        this.store.createRecord('worship-service'),
        worshipAdministrativeUnitValidations
      );
    } else {
      administrativeUnit = createValidatedChangeset(
        this.store.createRecord('administrative-unit'),
        administrativeUnitValidations
      );
    }

    if (params.classificationId) {
      const classification = await this.store.findRecord(
        'administrative-unit-classification-code',
        params.classificationId
      );
      administrativeUnit.classification = classification;
    }

    return {
      administrativeUnit,
      primarySite: this.store.createRecord('site'),
      address: createValidatedChangeset(
        this.store.createRecord('address'),
        getAddressValidations(true)
      ),
      contact: createValidatedChangeset(
        createPrimaryContact(this.store),
        contactValidations
      ),
      secondaryContact: createValidatedChangeset(
        createSecondaryContact(this.store),
        secondaryContactValidations
      ),
      identifierKBO: this.store.createRecord('identifier', {
        idName: ID_NAME.KBO,
      }),
      structuredIdentifierKBO: createValidatedChangeset(
        this.store.createRecord('structured-identifier'),
        getStructuredIdentifierKBOValidations(this.store)
      ),
      identifierSharepoint: this.store.createRecord('identifier', {
        idName: ID_NAME.SHAREPOINT,
      }),
      structuredIdentifierSharepoint: this.store.createRecord(
        'structured-identifier'
      ),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
