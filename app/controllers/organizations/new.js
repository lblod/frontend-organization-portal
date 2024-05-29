import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { action } from '@ember/object';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import fetch from 'fetch';
import { transformPhoneNumbers } from 'frontend-organization-portal/utils/transform-phone-numbers';
import { CLASSIFICATION } from '../../models/administrative-unit-classification-code';

export default class OrganizationsNewController extends Controller {
  @service router;
  @service store;
  @service features;

  @tracked currentOrganizationModel;

  get hasValidationErrors() {
    return (
      this.currentOrganizationModel.error ||
      this.model.address.error ||
      this.model.contact.error ||
      this.model.secondaryContact.error ||
      this.model.identifierKBO.error ||
      this.model.identifierSharepoint.error
    );
  }

  @action
  setRelation(organization) {
    this.currentOrganizationModel.isSubOrganizationOf = Array.isArray(
      organization
    )
      ? organization[0]
      : organization;

    if (
      this.currentOrganizationModel.isAgb ||
      this.currentOrganizationModel.isApb ||
      this.currentOrganizationModel.isOcmwAssociation ||
      this.currentOrganizationModel.isPevaMunicipality ||
      this.currentOrganizationModel.isPevaProvince
    ) {
      this.currentOrganizationModel.wasFoundedByOrganizations = Array.isArray(
        organization
      )
        ? organization
        : organization
        ? [organization]
        : [];
    }
  }

  @action
  setNames(name) {
    this.currentOrganizationModel.setAbbName(name);
  }

  @action
  setAlternativeNames(names) {
    this.currentOrganizationModel.setAlternativeName(names);
  }

  @action
  setHasParticipants(organizations) {
    this.currentOrganizationModel.hasParticipants = organizations;
  }

  @action
  setKbo(value) {
    this.model.structuredIdentifierKBO.localId = value;
  }

  @action
  setRecognizedWorshipType(recognizedWorshipType) {
    this.currentOrganizationModel.recognizedWorshipType = recognizedWorshipType;

    // Remove the relation to any set central worship service since not all
    // kinds of worship services require this.
    this.currentOrganizationModel.isSubOrganizationOf = null;
  }

  /**
   * Update the {@link currentOrganizationModel} to the model type that matches
   * the classification code selected by the user. This includes create a new
   * model instance and instantiating it with the necessary values already
   * filled in by the user. Any set relations with other organizations, for
   * example the organization at hand was founded by another one, are not
   * copied. These relations, and there interpretation, are typically specific
   * to the classification of an organization, it is up to the user to set the
   * necessary relations (again) via the form.
   *
   * @param {OrganizationClassificationCodeModel} classificationCode - the model
   *     object representing the classification code selected by the user.
   */
  @action
  organizationConverter(classificationCode) {
    // Note: extra guard to avoid infinite loop when setting the recognised
    // worship type ("Soort eredienst" field) triggers a refresh for the
    // classification, which in turn triggers a refresh of recognized worship
    // type and so on...
    if (
      classificationCode.id !== this.currentOrganizationModel.classification.id
    ) {
      // Create new model instance based on the provided classification
      let newOrganizationModelInstance = this.#createNewModelInstance(
        classificationCode.id
      );

      // Copy attributes and relationships to new model instance
      this.#copyPropertiesToModel(newOrganizationModelInstance);
      // Note: explicitly set here to ensure form is updated
      newOrganizationModelInstance.classification = classificationCode;

      // Delete the old model instance
      // Note: this sometimes causes an InternalError concerning too much
      // recursion to be thrown when the ember-inspector plugin is open. The
      // error seems to be specific to the plugin and does not seem to occur
      // otherwise.
      this.currentOrganizationModel.deleteRecord();

      // Update the organization model instance used by this controller
      this.currentOrganizationModel = newOrganizationModelInstance;
    }
  }

  /**
   * Create new organization model instance of the model type that matches the
   * provided classification code.
   *
   * @param {string} classificationCodeId - the unique identifier of
   *     the selected classification code.
   * @returns {OrganizationModel} New model instance that matches to provided
   *     classification code.
   */
  #createNewModelInstance(classificationCodeId) {
    // FIXME: This logic is somewhat duplicate with the classification getters
    // in the models. Should find a way to avoid having to manually add the
    // classification id when onboarding
    if (classificationCodeId === CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id) {
      return this.store.createRecord('central-worship-service');
    } else if (classificationCodeId === CLASSIFICATION.WORSHIP_SERVICE.id) {
      return this.store.createRecord('worship-service');
    } else if (
      [
        CLASSIFICATION.ZIEKENHUISVERENIGING.id,
        CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
          .id,
        CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
      ].includes(classificationCodeId)
    ) {
      return this.store.createRecord('registered-organization');
    } else if (
      [
        CLASSIFICATION.MUNICIPALITY.id,
        CLASSIFICATION.PROVINCE.id,
        CLASSIFICATION.OCMW.id,
        CLASSIFICATION.DISTRICT.id,
        CLASSIFICATION.AGB.id,
        CLASSIFICATION.APB.id,
        CLASSIFICATION.PROJECTVERENIGING.id,
        CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
        CLASSIFICATION.POLICE_ZONE.id,
        CLASSIFICATION.ASSISTANCE_ZONE.id,
        CLASSIFICATION.WELZIJNSVERENIGING.id,
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
        CLASSIFICATION.PEVA_MUNICIPALITY.id,
        CLASSIFICATION.PEVA_PROVINCE.id,
      ].includes(classificationCodeId)
    ) {
      return this.store.createRecord('administrative-unit');
    } else {
      return this.store.createRecord('organization');
    }
  }

  /**
   * Copy the properties of the {@link currentOrganizationModel} to the provided
   * model instance. Any relations the {@link currentOrganizationModel} has with
   * other organizations are *not* copied. These relations are dependent upon
   * the exact classification of the organization and should be explicitly set
   * by the user.
   *
   * @param {OrganizationModel} newOrganizationModel - the model instance to
   *     which the properties must be copied
   */
  #copyPropertiesToModel(newOrganizationModel) {
    newOrganizationModel.name = this.currentOrganizationModel.name;
    newOrganizationModel.legalName = this.currentOrganizationModel.legalName;
    newOrganizationModel.alternativeName =
      this.currentOrganizationModel.alternativeName;
    newOrganizationModel.organizationStatus =
      this.currentOrganizationModel.organizationStatus;

    if (newOrganizationModel.isWorshipAdministrativeUnit) {
      newOrganizationModel.recognizedWorshipType =
        this.currentOrganizationModel.recognizedWorshipType;
    }

    if (this.currentOrganizationModel.scope) {
      newOrganizationModel.scope = this.currentOrganizationModel.scope;
      if (newOrganizationModel.scope.locatedWithin) {
        newOrganizationModel.scope.locatedWithin =
          this.currentOrganizationModel.scope.locatedWithin;
      }
    }

    // Only IGSs have an, optional, expected end data and/or goal. Only copy
    // these values when new organization is also an IGS.
    if (newOrganizationModel.isIgs) {
      newOrganizationModel.expectedEndDate =
        this.currentOrganizationModel.expectedEndDate;
      if (this.currentOrganizationModel.purpose?.length) {
        newOrganizationModel.purpose = this.currentOrganizationModel.purpose;
      }
    }
  }

  @dropTask
  *createOrganizationTask(event) {
    event.preventDefault();

    let {
      primarySite,
      address,
      contact,
      secondaryContact,
      identifierSharepoint,
      identifierKBO,
      structuredIdentifierSharepoint,
      structuredIdentifierKBO,
    } = this.model;

    yield Promise.all([
      this.currentOrganizationModel.validate(),
      identifierKBO.validate(),
      identifierSharepoint.validate(),
    ]);

    if (
      this.features.isEnabled('edit-contact-data') ||
      this.currentOrganizationModel.isPrivateOcmwAssociation
    ) {
      yield Promise.all([
        address.validate(),
        contact.validate(),
        secondaryContact.validate(),
      ]);
    }

    if (!this.hasValidationErrors) {
      structuredIdentifierKBO = setEmptyStringsToNull(structuredIdentifierKBO);
      yield structuredIdentifierKBO.save();
      yield identifierKBO.save();

      structuredIdentifierSharepoint = setEmptyStringsToNull(
        structuredIdentifierSharepoint
      );
      yield structuredIdentifierSharepoint.save();
      yield identifierSharepoint.save();

      if (
        this.features.isEnabled('edit-contact-data') ||
        this.currentOrganizationModel.isPrivateOcmwAssociation
      ) {
        contact = setEmptyStringsToNull(contact);
        contact.telephone = transformPhoneNumbers(contact.telephone);
        yield contact.save();

        secondaryContact = setEmptyStringsToNull(secondaryContact);
        secondaryContact.telephone = transformPhoneNumbers(
          secondaryContact.telephone
        );
        yield secondaryContact.save();

        if (!address.isCountryBelgium) {
          address.province = '';
        }

        address.fullAddress = combineFullAddress(address);
        address = setEmptyStringsToNull(address);
        yield address.save();

        primarySite.address = address;
        (yield primarySite.contacts).push(contact, secondaryContact);
        if (
          this.currentOrganizationModel.isAgb ||
          this.currentOrganizationModel.isApb ||
          this.currentOrganizationModel.isIGS ||
          this.currentOrganizationModel.isPoliceZone ||
          this.currentOrganizationModel.isAssistanceZone ||
          this.currentOrganizationModel.isOcmwAssociation ||
          this.currentOrganizationModel.isPevaMunicipality ||
          this.currentOrganizationModel.isPevaProvince
        ) {
          const siteTypes = yield this.store.findAll('site-type');
          primarySite.siteType = siteTypes.find(
            (t) => t.id === 'f1381723dec42c0b6ba6492e41d6f5dd'
          );
        }
        yield primarySite.save();
        this.currentOrganizationModel.primarySite = primarySite;
      }

      (yield this.currentOrganizationModel.identifiers).push(
        identifierKBO,
        identifierSharepoint
      );

      this.currentOrganizationModel = setEmptyStringsToNull(
        this.currentOrganizationModel
      );

      yield this.currentOrganizationModel.save();

      const createRelationshipsEndpoint = `/construct-organization-relationships/${this.currentOrganizationModel.id}`;
      yield fetch(createRelationshipsEndpoint, {
        method: 'POST',
      });

      const syncKboData = `/kbo-data-sync/${structuredIdentifierKBO.id}`;
      yield fetch(syncKboData, {
        method: 'POST',
      });

      this.router.replaceWith(
        'organizations.organization',
        this.currentOrganizationModel.id
      );
    }
  }

  reset() {
    this.model.primarySite.rollbackAttributes();
    this.model.identifierSharepoint.reset();
    this.model.identifierKBO.reset();
    this.model.structuredIdentifierSharepoint.rollbackAttributes();
    this.model.structuredIdentifierKBO.rollbackAttributes();
    this.currentOrganizationModel.reset();
    this.model.contact.reset();
    this.model.secondaryContact.reset();
    this.model.address.reset();
  }
}
