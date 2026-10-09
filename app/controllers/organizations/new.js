import Controller from '@ember/controller';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { action } from '@ember/object';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import isContactEditableOrganization from 'frontend-organization-portal/utils/editable-contact-data';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import { membershipFieldsByClassification } from 'frontend-organization-portal/constants/memberships';
import {
  allowedClassificationsForMembershipField,
  fieldMeetsMinimum,
  minimumRequiredFieldMessage,
} from 'frontend-organization-portal/utils/membership-rules';
import {
  findAll,
  query as queryBuilder,
  saveRecord,
} from '@warp-drive/legacy/compat/builders';
import requiresKbo from '../../helpers/requires-kbo';

export default class OrganizationsNewController extends Controller {
  @service router;
  @service store;
  @service features;
  @service scopeOfOperation;

  @tracked currentOrganizationModel;

  @tracked memberships = [];
  @tracked membershipsOfOrganizations = [];

  @tracked founders = [];
  @tracked municipality;
  @tracked province;

  @tracked worshipServices = [];
  @tracked centralWorshipService;
  @tracked representativeBody;

  // Keeps the organizations the user picked in each related-organization
  // field, keyed by `${roleId}-${asMember}` (`asMember` distinguishes the
  // field's side of the relation).
  @tracked fieldSelections = {};

  @tracked relatedNonActiveOrganization;
  @tracked setRelatedOrganizationFunction;

  @tracked locations;

  /**
   * The related-organization fields of the "Gerelateerde organisaties" card,
   * per classification (see `membershipFieldsByClassification`).
   */
  get membershipFields() {
    const classificationId =
      this.currentOrganizationModel.classification?.get('id');
    const fields = membershipFieldsByClassification[classificationId] ?? [];

    return fields
      .filter((field) => !field.skipCreateForm)
      .map((field) => ({
        key: `${field.role.id}-${field.asMember}`,
        label: field.asMember ? field.role.label : field.role.inverseLabel,
        classificationCodes: allowedClassificationsForMembershipField(
          classificationId,
          field,
        ),
        required: field.required,
        multiple: field.multiple,
        minimum: field.minimum,
        role: field.role,
        asMember: field.asMember,
        selectedOrganizations:
          this.fieldSelections[`${field.role.id}-${field.asMember}`] ?? [],
        selectedOrganization:
          this.fieldSelections[`${field.role.id}-${field.asMember}`]?.[0],
        error: this.getFieldError(field),
      }));
  }

  get hasValidationErrors() {
    return (
      this.currentOrganizationModel.error ||
      this.model.address.error ||
      this.model.contact.error ||
      this.model.secondaryContact.error ||
      (requiresKbo(this.currentOrganizationModel) &&
        this.model.identifierKBO.error) ||
      this.model.identifierSharepoint.error ||
      this.memberships.some((membership) => membership.error) ||
      this.membershipsOfOrganizations.some((membership) => membership.error)
    );
  }

  @action
  confirmRelateNonActiveOrganization() {
    this.setRelatedOrganizationFunction(this.relatedNonActiveOrganization);
    this.#unsetNonActiveRelationVariables();
  }

  @action
  cancelRelateNonActiveOrganization() {
    this.#unsetNonActiveRelationVariables();
  }

  get isRelatedNonActiveOrganization() {
    return (
      this.relatedNonActiveOrganization && this.setRelatedOrganizationFunction
    );
  }

  #setNonActiveRelationVariables(fn, value) {
    this.setRelatedOrganizationFunction = fn;
    this.relatedNonActiveOrganization = value;
  }

  #unsetNonActiveRelationVariables() {
    this.setRelatedOrganizationFunction = undefined;
    this.relatedNonActiveOrganization = undefined;
  }

  #getNewOrganization(original, altered) {
    if (altered) {
      return altered.filter((org) => !original.includes(org)).pop();
    }
  }

  @action
  setMunicipality(municipality) {
    if (!municipality || municipality.isActive) {
      this.#reallySetMunicipality(municipality);
    } else {
      this.#setNonActiveRelationVariables(
        this.#reallySetMunicipality,
        municipality,
      );
    }
  }

  async #getProvinceForMunicipality(municipality) {
    const { content: provinces } = await this.store.request(
      queryBuilder('organization', {
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
      }),
    );
    return provinces[0];
  }

  async #reallySetMunicipality(municipality) {
    this.municipality = municipality;

    if (municipality) {
      this.setProvince(await this.#getProvinceForMunicipality(municipality));

      if (this.currentOrganizationModel.isAgb) {
        // NOTE (27/02/2025) We set the founder here directly instead of using the
        // `addFounders` function. Using the function would result in two
        // confirmation modals popping up when the user sets a non-active
        // municipality.
        this.founders = [municipality];
      }
    }
  }

  #getErrorMessageForMembershipField(field) {
    const membershipWithError = [
      ...this.memberships,
      ...this.membershipsOfOrganizations,
    ].find((membership) => membership.error);

    if (!field || field.length === 0) {
      return (
        membershipWithError?.error.role.message ??
        this.currentOrganizationModel.error?.memberships?.message ??
        this.currentOrganizationModel.error?.membershipsOfOrganizations?.message
      );
    }
  }

  get municipalityError() {
    return this.#founderFieldError();
  }

  /**
   * The error to show under a related-organization field: a mandatory field
   * below its minimum gets a message naming what is missing, e.g. "Kies
   * minstens 1 OCMW". Only shown once a save attempt failed on the
   * memberships.
   */
  getFieldError(field) {
    if (!this.#hasMembershipValidationErrors()) return;

    const memberships = [
      ...this.memberships,
      ...this.membershipsOfOrganizations,
    ];
    if (
      field.required &&
      !fieldMeetsMinimum(field, this.currentOrganizationModel, memberships)
    ) {
      return minimumRequiredFieldMessage(
        field,
        this.currentOrganizationModel.classification?.get('id'),
      );
    }
  }

  #hasMembershipValidationErrors() {
    return (
      this.currentOrganizationModel.error?.memberships ||
      this.memberships.some((membership) => membership.error) ||
      this.membershipsOfOrganizations.some((membership) => membership.error)
    );
  }

  // The AGB/APB blocks render the founder field themselves through the
  // municipality/province select, its error comes from the same configuration.
  #founderFieldError() {
    const classificationId =
      this.currentOrganizationModel.classification?.get('id');
    const founderField = (
      membershipFieldsByClassification[classificationId] ?? []
    ).find(
      (field) =>
        field.role.id === MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id &&
        !field.asMember,
    );
    return founderField && this.getFieldError(founderField);
  }

  @action
  setProvince(province) {
    // NOTE (26/02/2025) All Flemish provinces are active. Therefore, in
    // contrast to the case with municipalities, we do not check the status of
    // the set province nor ask the user for confirmation when trying to set an
    // inactive organisation.
    this.province = province;

    if (this.currentOrganizationModel.isApb) {
      // NOTE (27/02/2025) Set the founder directly to avoid the organization
      // status logic gets executed.
      this.founders = [province];
    }
  }

  get provinceError() {
    return this.#founderFieldError();
  }

  @action
  addOrganizationsForField(field, organizations) {
    const newOrganization = this.#getNewOrganization(
      this.fieldSelections[field.key] ?? [],
      organizations,
    );

    if (!newOrganization || newOrganization.isActive) {
      this.#reallySetOrganizationsForField(field, organizations);
    } else {
      this.#setNonActiveRelationVariables(
        (orgs) => this.#reallySetOrganizationsForField(field, orgs),
        organizations,
      );
    }
  }

  @action
  setOrganizationForField(field, organization) {
    if (!organization || organization.isActive) {
      this.#reallySetOrganizationsForField(
        field,
        organization ? [organization] : [],
      );
    } else {
      this.#setNonActiveRelationVariables(
        (org) => this.#reallySetOrganizationsForField(field, org ? [org] : []),
        organization,
      );
    }
  }

  #reallySetOrganizationsForField(field, organizations) {
    this.fieldSelections = {
      ...this.fieldSelections,
      [field.key]: organizations,
    };
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
  setKbo(event) {
    this.model.structuredIdentifierKBO.localId =
      event.target.inputmask.unmaskedvalue();
  }

  @action
  setRecognizedWorshipType(recognizedWorshipType) {
    this.currentOrganizationModel.recognizedWorshipType = recognizedWorshipType;

    // Remove the relation to any selected central worship service since not all
    // kinds of worship services require this.
    this.centralWorshipService = null;
  }

  @action
  setLegalForm(legalForm) {
    this.currentOrganizationModel.legalForm = legalForm;
  }

  @action
  setContentThemes(contentThemes) {
    this.currentOrganizationModel.contentThemes = contentThemes;
  }

  @action
  addCentralWorshipService(centralWorshipService) {
    if (!centralWorshipService || centralWorshipService.isActive) {
      this.#reallySetCentralWorshipService(centralWorshipService);
    } else {
      this.#setNonActiveRelationVariables(
        this.#reallySetCentralWorshipService,
        centralWorshipService,
      );
    }
  }

  #reallySetCentralWorshipService(centralWorshipService) {
    this.centralWorshipService = centralWorshipService;
  }

  @action
  addRepresentativeBody(representativeBody) {
    if (!representativeBody || representativeBody.isActive) {
      this.#reallySetRepresentativeBody(representativeBody);
    } else {
      this.#setNonActiveRelationVariables(
        this.#reallySetRepresentativeBody,
        representativeBody,
      );
    }
  }

  #reallySetRepresentativeBody(representativeBody) {
    this.representativeBody = representativeBody;
  }

  get representativeBodyError() {
    return this.#getErrorMessageForMembershipField(this.representativeBody);
  }

  @action
  addWorshipServices(worshipServices) {
    const newWorshipService = this.#getNewOrganization(
      this.worshipServices,
      worshipServices,
    );

    if (!newWorshipService || newWorshipService.isActive) {
      this.#reallySetWorshipServices(worshipServices);
    } else {
      this.#setNonActiveRelationVariables(
        this.#reallySetWorshipServices,
        worshipServices,
      );
    }
  }

  #reallySetWorshipServices(worshipServices) {
    this.worshipServices = worshipServices;
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
        classificationCode.id,
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
      this.memberships = [];
      this.membershipsOfOrganizations = [];
      this.fieldSelections = {};
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
        CLASSIFICATION.ZORGRAAD.id,
        CLASSIFICATION.REGIONAAL_ZORGPLATFORM.id,
        CLASSIFICATION.REGIONAAL_LANDSCHAP.id,
        CLASSIFICATION.BOSGROEP.id,
        CLASSIFICATION.WOONMAATSCHAPPIJ.id,
        CLASSIFICATION.ANDERE.id,
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
        CLASSIFICATION.INTERLOKALE_VERENIGING.id,
        CLASSIFICATION.VERVOERREGIORAAD.id,
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
    newOrganizationModel.organizationStatus = this.currentOrganizationModel
      .belongsTo('organizationStatus')
      .value();
    newOrganizationModel.legalForm = this.currentOrganizationModel
      .belongsTo('legalForm')
      .value();

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
      newOrganizationModel.scope = this.currentOrganizationModel
        .belongsTo('scope')
        .value();
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

  createOrganizationTask = dropTask(async (event) => {
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

    // Note: non-worship organizations only get specific relations (founder,
    // member, ...). The generic "has a relation with" role is reserved for
    // worship organizations, see the related-organizations route.

    // Founders are set by the AGB/APB blocks (municipality/province select).
    this.memberships.push(
      ...this.#createMembershipModels(
        this.founders,
        MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id,
      ),
    );

    // The fields of the classification config. "Is lid van" puts the created
    // organization on the `member` side, the other fields on the
    // `organization` side.
    this.membershipFields.forEach((field) => {
      const createdMemberships = this.#createMembershipModels(
        this.fieldSelections[field.key] ?? [],
        field.role.id,
        field.asMember,
      );
      (field.asMember
        ? this.membershipsOfOrganizations
        : this.memberships
      ).push(...createdMemberships);
    });

    if (this.currentOrganizationModel.isCentralWorshipService) {
      this.memberships.push(
        ...this.#createMembershipModels(
          this.worshipServices,
          MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
        ),
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
            true,
          ),
        );
      }

      if (this.representativeBody) {
        this.memberships.push(
          ...this.#createMembershipModels(
            [this.representativeBody],
            MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
          ),
        );
      }
    }

    this.currentOrganizationModel.memberships = this.memberships;
    this.currentOrganizationModel.membershipsOfOrganizations =
      this.membershipsOfOrganizations;

    await Promise.all(
      this.memberships.map((membership) =>
        membership.validate({ creatingNewOrganization: true }),
      ),
    );

    await Promise.all(
      this.membershipsOfOrganizations.map((membership) =>
        membership.validate({ creatingNewOrganization: true }),
      ),
    );

    this.currentOrganizationModel.scope =
      this.locations?.length > 0
        ? await this.scopeOfOperation.getScopeForLocations(...this.locations)
        : null;

    const requiresKboNumber = requiresKbo(this.currentOrganizationModel);

    await Promise.all([
      this.currentOrganizationModel.validate({ creatingNewOrganization: true }),
      requiresKboNumber
        ? identifierKBO.validate()
        : identifierKBO.resetErrors(),
      identifierSharepoint.validate(),
    ]);

    if (
      this.features.isEnabled('edit-contact-data') ||
      isContactEditableOrganization(this.currentOrganizationModel)
    ) {
      await Promise.all([
        address.validate(),
        contact.validate(),
        secondaryContact.validate(),
      ]);
    }

    if (!this.hasValidationErrors) {
      if (requiresKboNumber) {
        structuredIdentifierKBO = setEmptyStringsToNull(
          structuredIdentifierKBO,
        );
        await this.store.request(saveRecord(structuredIdentifierKBO));
        await this.store.request(saveRecord(identifierKBO));
      }

      structuredIdentifierSharepoint = setEmptyStringsToNull(
        structuredIdentifierSharepoint,
      );
      await this.store.request(saveRecord(structuredIdentifierSharepoint));
      await this.store.request(saveRecord(identifierSharepoint));

      if (
        this.features.isEnabled('edit-contact-data') ||
        isContactEditableOrganization(this.currentOrganizationModel)
      ) {
        contact = setEmptyStringsToNull(contact);
        await this.store.request(saveRecord(contact));

        secondaryContact = setEmptyStringsToNull(secondaryContact);
        await this.store.request(saveRecord(secondaryContact));

        if (!address.isPostcodeInFlanders) {
          address.province = '';
        }

        address.fullAddress = combineFullAddress(address);
        address = setEmptyStringsToNull(address);
        await this.store.request(saveRecord(address));

        primarySite.address = address;
        (await primarySite.contacts).push(contact, secondaryContact);
        if (
          this.currentOrganizationModel.isAgb ||
          this.currentOrganizationModel.isApb ||
          this.currentOrganizationModel.isIGS ||
          this.currentOrganizationModel.isPoliceZone ||
          this.currentOrganizationModel.isAssistanceZone ||
          this.currentOrganizationModel.isOcmwAssociation ||
          this.currentOrganizationModel.isPevaMunicipality ||
          this.currentOrganizationModel.isPevaProvince ||
          this.currentOrganizationModel.isAndere
        ) {
          const { content: siteTypes } = await this.store.request(
            findAll('site-type'),
          );
          primarySite.siteType = siteTypes.find(
            (t) => t.id === 'f1381723dec42c0b6ba6492e41d6f5dd',
          );
        }
        await this.store.request(saveRecord(primarySite));
        this.currentOrganizationModel.primarySite = primarySite;
      }
      const identifiers = await this.currentOrganizationModel.identifiers;
      if (requiresKboNumber) {
        identifiers.push(identifierKBO);
      }
      identifiers.push(identifierSharepoint);

      this.currentOrganizationModel = setEmptyStringsToNull(
        this.currentOrganizationModel,
      );

      await this.store.request(saveRecord(this.currentOrganizationModel));

      let membershipSavePromises = this.memberships.map((membership) =>
        this.store.request(saveRecord(membership)),
      );
      await Promise.all(membershipSavePromises);

      let membershipsOfOrganizationsSavePromises =
        this.membershipsOfOrganizations.map((membership) =>
          this.store.request(saveRecord(membership)),
        );
      await Promise.all(membershipsOfOrganizationsSavePromises);

      const createRelationshipsEndpoint = `/construct-organization-relationships/create-relationships/${this.currentOrganizationModel.id}`;
      await fetch(createRelationshipsEndpoint, {
        method: 'POST',
      });

      if (requiresKboNumber) {
        const syncKboData = `/kbo-data-sync/${structuredIdentifierKBO.id}`;
        await fetch(syncKboData, {
          method: 'POST',
        });
      }

      this.router.replaceWith(
        'organizations.organization',
        this.currentOrganizationModel.id,
      );
    }
  });

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
    this.founders = [];
    this.fieldSelections = {};
    this.municipality = null;
    this.province = null;
    this.worshipServices = [];
    this.centralWorshipService = null;
    this.representativeBody = null;
    this.relatedNonActiveOrganization = null;
    this.setRelatedOrganizationFunction = null;
    this.locations = null;
  }
}
