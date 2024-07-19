import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { action } from '@ember/object';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import fetch from 'fetch';
import { transformPhoneNumbers } from 'frontend-organization-portal/utils/transform-phone-numbers';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import isContactEditableOrganization from 'frontend-organization-portal/utils/editable-contact-data';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';

export default class OrganizationsNewController extends Controller {
  @service router;
  @service store;
  @service features;

  @tracked currentOrganizationModel;

  @tracked memberships = [];
  @tracked membershipsOfOrganizations = [];

  @tracked founders = [];
  @tracked participants = [];
  @tracked municipality;
  @tracked province;

  @tracked worshipServices = [];
  @tracked centralWorshipService;
  @tracked representativeBody;

  get hasValidationErrors() {
    return (
      this.currentOrganizationModel.error ||
      this.model.address.error ||
      this.model.contact.error ||
      this.model.secondaryContact.error ||
      this.model.identifierKBO.error ||
      this.model.identifierSharepoint.error ||
      this.memberships.some((membership) => membership.error) ||
      this.membershipsOfOrganizations.some((membership) => membership.error)
    );
  }

  @action
  async setMunicipality(municipality) {
    this.municipality = municipality;

    if (municipality) {
      this.setProvince(
        (
          await this.store.query('organization', {
            filter: {
              memberships: {
                member: {
                  id: municipality.id,
                },
              },
              classification: {
                id: CLASSIFICATION.PROVINCE.id,
              },
            },
          })
        )[0]
      );

      if (this.currentOrganizationModel.isAgb) {
        this.addFounders(municipality);
      }
    }
  }

  #getErrorMessageForMembershipField(field) {
    const membershipWithError = this.memberships.find(
      (membership) => membership.error
    );

    if (!field || field.length === 0) {
      return membershipWithError
        ? membershipWithError.error.role.message
        : this.currentOrganizationModel.error?.memberships?.message;
    }
  }

  get municipalityError() {
    return this.#getErrorMessageForMembershipField(this.municipality);
  }

  @action
  setProvince(province) {
    this.province = province;

    if (this.currentOrganizationModel.isApb) {
      this.addFounders(province);
    }
  }

  get provinceError() {
    return this.#getErrorMessageForMembershipField(this.province);
  }

  @action
  addFounders(organizations) {
    if (organizations) {
      organizations = Array.isArray(organizations)
        ? organizations
        : [organizations];
    }
    this.founders = organizations;
  }

  get foundersError() {
    return this.#getErrorMessageForMembershipField(this.founders);
  }

  get participantsError() {
    return this.#getErrorMessageForMembershipField(this.participants);
  }

  get representativeBodyError() {
    return this.#getErrorMessageForMembershipField(this.representativeBody);
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
  setKbo(value) {
    this.model.structuredIdentifierKBO.localId = value;
  }

  @action
  setRecognizedWorshipType(recognizedWorshipType) {
    this.currentOrganizationModel.recognizedWorshipType = recognizedWorshipType;

    // Remove the relation to any selected central worship service since not all
    // kinds of worship services require this.
    this.centralWorshipService = null;
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
      // Delete any created memberships
      this.founders = [];
      this.participants = [];
      this.municipality = null;
      this.province = null;

      this.worshipServices = [];
      this.centralWorshipService = null;
      this.representativeBody = null;

      // Update the organization model instance used by this controller
      this.currentOrganizationModel = newOrganizationModelInstance;
    }
  }

  /**
   * Create new organization model instance of the model type that matches the
   * provided classification code.
   *
   * @param {string} classificationCodeId - the unique identifier of the
   *     selected classification code.
   * @returns {OrganizationModel} New model instance that matches to provided
   *     classification code.
   */
  #createNewModelInstance(classificationCodeId) {
    // TODO: move logic to determine correct model to some util, that uses
    // information from the CLASSIFICATION data structure
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
        CLASSIFICATION.ASSOCIATION_OTHER.id,
        CLASSIFICATION.CORPORATION_OTHER.id,
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

    // Scope is defined in the administrative unit model, only copy if both
    // source and target model are of that type. Otherwise, it can cause errors
    // when user changes the selected organizations types and classifications
    // code in the form.
    if (
      this.currentOrganizationModel.isAdministrativeUnit &&
      newOrganizationModel.isAdministrativeUnit &&
      this.currentOrganizationModel.scope
    ) {
      newOrganizationModel.scope = this.currentOrganizationModel.scope;
      if (this.currentOrganizationModel.scope.locatedWithin) {
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

  /**
   * Create a model for new membership between the current organization model
   * and each of the provided organizations.
   * @param {@link OrganizationModel} organizations - The organizations to
   *     create memberships for.
   * @param {@link MembershipRoleModel} roleId - The role of the memberships
   *     to create.
   * @param {*} inverse - If truthy set the current organization as member,
   *     otherwise the provided organizations are set as members.
   * @returns {@link MembershipModel} A new membership model.
   */
  #createMembershipModels(organizations, roleId, inverse) {
    if (organizations) {
      const roleModel = this.model.roles.find((r) => r.id === roleId);
      const memberships = [];

      organizations.forEach((organization) => {
        const membership = this.store.createRecord('membership', {
          member: inverse ? this.currentOrganizationModel : organization,
          organization: inverse ? organization : this.currentOrganizationModel,
          role: roleModel,
        });
        memberships.push(membership);
      });
      return memberships;
    }
    return [];
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

    this.memberships = [];
    this.membershipsOfOrganizations = [];

    if (this.municipality && !this.currentOrganizationModel.isAgb) {
      this.memberships.push(
        ...this.#createMembershipModels(
          [this.municipality],
          MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id
        )
      );
    }

    if (
      this.province &&
      !this.currentOrganizationModel.isApb &&
      !this.currentOrganizationModel.isIgs
    ) {
      this.memberships.push(
        ...this.#createMembershipModels(
          [this.province],
          MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id
        )
      );
    }

    this.memberships.push(
      ...this.#createMembershipModels(
        this.founders,
        MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id
      ),
      ...this.#createMembershipModels(
        this.participants,
        MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id
      )
    );

    if (this.currentOrganizationModel.isCentralWorshipService) {
      this.memberships.push(
        ...this.#createMembershipModels(
          this.worshipServices,
          MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id
        )
      );
    }

    if (this.currentOrganizationModel.isWorshipAdministrativeUnit) {
      if (
        this.currentOrganizationModel.hasCentralWorshipService &&
        this.centralWorshipService
      ) {
        this.membershipsOfOrganizations.push(
          ...this.#createMembershipModels(
            [this.centralWorshipService],
            MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
            true
          )
        );
      }

      if (this.representativeBody) {
        this.memberships.push(
          ...this.#createMembershipModels(
            [this.representativeBody],
            MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id
          )
        );
      }
    }

    this.currentOrganizationModel.memberships = this.memberships;
    this.currentOrganizationModel.membershipsOfOrganizations =
      this.membershipsOfOrganizations;

    yield Promise.all(
      this.memberships.map((membership) =>
        membership.validate({ creatingNewOrganization: true })
      )
    );

    yield Promise.all(
      this.membershipsOfOrganizations.map((membership) =>
        membership.validate({ creatingNewOrganization: true })
      )
    );

    yield Promise.all([
      this.currentOrganizationModel.validate({ creatingNewOrganization: true }),
      identifierKBO.validate(),
      identifierSharepoint.validate(),
    ]);

    if (
      this.features.isEnabled('edit-contact-data') ||
      isContactEditableOrganization(this.currentOrganizationModel)
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
        isContactEditableOrganization(this.currentOrganizationModel)
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
          this.currentOrganizationModel.isPevaProvince ||
          this.currentOrganizationModel.isAssociationOther ||
          this.currentOrganizationModel.isCorporationOther
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

      let membershipSavePromises =
        this.currentOrganizationModel.memberships.map((membership) =>
          membership.save()
        );
      yield Promise.all(membershipSavePromises);

      let membershipsOfOrganizationsSavePromises =
        this.currentOrganizationModel.membershipsOfOrganizations.map(
          (membership) => membership.save()
        );
      yield Promise.all(membershipsOfOrganizationsSavePromises);

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
    this.memberships = [];
    this.membershipsOfOrganizations = [];
    this.municipality = null;
    this.province = null;
    this.worshipServices = [];
    this.centralWorshipService = null;
    this.representativeBody = null;
  }
}
