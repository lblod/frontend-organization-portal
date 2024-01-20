import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { tracked } from '@glimmer/tracking';

const RESULTING_STATUS_FOR_CHANGE_EVENT_TYPE = {
  [CHANGE_EVENT_TYPE.NAME_CHANGE]: ORGANIZATION_STATUS.ACTIVE,
  [CHANGE_EVENT_TYPE.IN_ONTBINDING]: ORGANIZATION_STATUS.ACTIVE,
  [CHANGE_EVENT_TYPE.OPRICHTING]: ORGANIZATION_STATUS.ACTIVE,
  [CHANGE_EVENT_TYPE.IN_VEREFFENING]: ORGANIZATION_STATUS.ACTIVE,
  [CHANGE_EVENT_TYPE.ONTBONDEN_EN_VEREFFEND]: ORGANIZATION_STATUS.INACTIVE,
  [CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE]: ORGANIZATION_STATUS.ACTIVE,
  [CHANGE_EVENT_TYPE.RECOGNITION_NOT_GRANTED]: ORGANIZATION_STATUS.INACTIVE,
  [CHANGE_EVENT_TYPE.RECOGNITION_LIFTED]: ORGANIZATION_STATUS.INACTIVE,
  [CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED]: ORGANIZATION_STATUS.IN_FORMATION,
  [CHANGE_EVENT_TYPE.RECOGNITION_GRANTED]: ORGANIZATION_STATUS.ACTIVE,
  [CHANGE_EVENT_TYPE.SUSPENSION_OF_RECOGNITION]: ORGANIZATION_STATUS.INACTIVE,
  [CHANGE_EVENT_TYPE.SANCTIONED]: ORGANIZATION_STATUS.ACTIVE,
  [CHANGE_EVENT_TYPE.CITY]: ORGANIZATION_STATUS.ACTIVE,
  [CHANGE_EVENT_TYPE.GEOGRAPHICAL_AREA_CHANGE]: ORGANIZATION_STATUS.ACTIVE,
  // MERGER and FUSIE aren't added here since they have multiple resulting
  // statuses based on the resulting organization
};

export default class AdministrativeUnitsAdministrativeUnitChangeEventsNewController extends Controller {
  @service router;
  @service store;

  // TODO: try to get rid of these tracked variables
  @tracked
  isAddingOriginalOrganizations = true;

  @tracked
  selectedResultingOrganization;

  get hasValidationErrors() {
    return this.model.changeEvent.error || this.model.decision?.error;
  }

  get classificationCodes() {
    return [this.model.classification.id];
  }

  // TODO: replace this with a `url-for` helper.
  get administrativeUnitCreationUrl() {
    return this.router.urlFor('administrative-units.new');
  }
  @action
  filterSelectedOriginalOrganizations(searchResults) {
    return searchResults.filter(
      (organization) =>
        !this.model.changeEvent.originalOrganizations.includes(organization)
    );
  }

  /**
   * Update the original organizations related to the change event being
   * created. If only one argument is provided this organization is added as a
   * new original organization. Otherwise, if two arguments are provided the
   * second one is considered as a replacement of the first. In other words the
   * first organization will be removed as original organisation and the second
   * organization is added as a new one.
   * If the change event is being created for a central worship service, the
   * provided arguments are also removed as possible resulting organizations.
   * @param {AdministrativeUnitModel} previousOrganization
   * @param {AdministrativeUnitModel} organization
   */
  @action
  updateOriginalOrganizations(previousOrganization, organization) {
    if (organization) {
      this.removeOriginalOrganization(previousOrganization);
      this.model.changeEvent.addOriginalOrganization(organization);
    } else {
      this.model.changeEvent.addOriginalOrganization(previousOrganization);
    }
    this.isAddingOriginalOrganizations = false;

    // TODO: Would it not be more user-friendly integrate the logic below as a
    // rule in the validation? Silently altering values in the form seems weird

    // Central worship service mergers must result in a new/different
    // organisation than the original ones. Therefore reset the value of the
    // selected resulting organisation if this is the same as the newly selected
    // original organisation
    if (this.model.administrativeUnit.isCentralWorshipService) {
      this.model.changeEvent.removeResultingOrganization(previousOrganization);
      this.model.changeEvent.removeResultingOrganization(organization);
      this.selectedResultingOrganization = null;
    }
  }

  /**
   * Remove a previously added organization as original organization for the
   * change event being created. This has only effect if the provided
   * organization is not the same as the organization for which this change
   * event is being created.
   * If the change event concerns an organization which is *not* a central
   * worship service the organization is also removed as potential resulting
   * organization.
   * @param {AdministrativeUnitModel} organization - the organization that
   * should be removed as original organization
   */
  @action
  removeOriginalOrganization(organization) {
    if (organization && this.model.administrativeUnit !== organization) {
      this.model.changeEvent.removeOriginalOrganization(organization);

      if (
        !this.model.administrativeUnit.isCentralWorshipService &&
        this.model.changeEvent.hasAsresultingOrganization(organization)
      ) {
        this.model.changeEvent.removeResultingOrganization(organization);
        this.selectedResultingOrganization = null;
      }
    }
  }

  /**
   * Add the provided organization as resulting organization for the change
   * event being created.
   * Note this currently means that any previously specified resulting
   * organization is removed as the form only supports specifying one resulting
   * organization.
   * @param {AdministrativeUnitModel} organization - the organization to be
   * added as resulting organization
   */
  @action
  updateResultingOrganizations(organization) {
    this.model.changeEvent.addResultinfOrganization(organization);
  }

  @dropTask
  *createNewChangeEventTask(event) {
    event.preventDefault();

    const {
      administrativeUnit: currentOrganization,
      classification,
      changeEvent,
      decision,
      decisionActivity,
    } = this.model;

    let shouldSaveDecision = this.model.changeEvent.requiresDecisionInformation;

    yield changeEvent.validate();

    if (shouldSaveDecision) {
      yield decision.validate();
    }

    if (!changeEvent.error && (shouldSaveDecision ? !decision.error : true)) {
      changeEvent.decision = yield saveDecision(
        shouldSaveDecision,
        decision,
        decisionActivity
      );

      let changeEventType = changeEvent.type;

      // We save the change event already so the backend assigns it an id
      // which is needed when saving the change-event-results
      yield changeEvent.save();

      if (this.model.changeEvent.canAffectMultipleOrganizations()) {
        // TODO: superfluous variable?
        let allOriginalOrganizations =
          changeEvent.originalOrganizations.toArray();

        let createChangeEventResultsPromises = [];

        // We create change event results for all organizations that are
        // affected by the new change event
        for (let organization of allOriginalOrganizations) {
          let resultingStatusId;

          if (
            // TODO: use model method
            changeEventType.get('id') === CHANGE_EVENT_TYPE.MERGER ||
            changeEventType.get('id') === CHANGE_EVENT_TYPE.FUSIE
          ) {
            if (this.model.administrativeUnit.isCentralWorshipService) {
              resultingStatusId = ORGANIZATION_STATUS.INACTIVE;
            } else {
              resultingStatusId = changeEvent.resultingOrganizations.includes(
                organization
              )
                ? ORGANIZATION_STATUS.ACTIVE
                : ORGANIZATION_STATUS.INACTIVE;
            }
          } else {
            resultingStatusId =
              RESULTING_STATUS_FOR_CHANGE_EVENT_TYPE[changeEventType.get('id')];
          }

          createChangeEventResultsPromises.push(
            createChangeEventResult({
              resultingStatusId,
              resultingOrganization: organization,
              changeEvent,
              store: this.store,
            })
          );
        }

        if (
          // TODO: use model function
          changeEventType.get('id') === CHANGE_EVENT_TYPE.MERGER ||
          changeEventType.get('id') === CHANGE_EVENT_TYPE.FUSIE
        ) {
          if (this.model.administrativeUnit.isCentralWorshipService) {
            // Central worship services should always select a *new*
            // organization as the resulting organization, so we also create a
            // change event result for that organization
            createChangeEventResultsPromises.push(
              createChangeEventResult({
                resultingStatusId: ORGANIZATION_STATUS.ACTIVE,
                // TODO: assumed here that there is only one resulting organization
                resultingOrganization:
                  changeEvent.resultingOrganizations.toArray()[0],
                changeEvent,
                store: this.store,
              })
            );
          }
        } else {
          changeEvent.resultingOrganizations.pushObjects(
            allOriginalOrganizations
          );
        }

        yield Promise.all(createChangeEventResultsPromises);
      } else {
        if (
          changeEventType.get('id') !== CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED
        ) {
          changeEvent.originalOrganizations.pushObject(currentOrganization);
        }

        if (
          ![
            CHANGE_EVENT_TYPE.RECOGNITION_LIFTED,
            CHANGE_EVENT_TYPE.RECOGNITION_NOT_GRANTED,
          ].includes(changeEventType.get('id'))
        ) {
          changeEvent.resultingOrganizations.pushObject(currentOrganization);
        }
        // TODO: is this necessary for some reason or a leftover from debugging?
        console.log(
          'Resulting status id: ' +
            RESULTING_STATUS_FOR_CHANGE_EVENT_TYPE[changeEventType.get('id')]
        );
        yield createChangeEventResult({
          resultingStatusId:
            RESULTING_STATUS_FOR_CHANGE_EVENT_TYPE[changeEventType.get('id')],
          resultingOrganization: currentOrganization,
          changeEvent,
          store: this.store,
        });
      }

      // Persist the original and resulting organization information
      yield changeEvent.save();

      // TODO: fusion event are currently not supported for municipalities or
      // OCMW, this can probably be removed
      if (
        (classification.id === CLASSIFICATION_CODE.MUNICIPALITY ||
          classification.id === CLASSIFICATION_CODE.OCMW) &&
        changeEventType.get('id') === CHANGE_EVENT_TYPE.FUSIE
      ) {
        mergeAssociated({
          store: this.store,
          changeEvent,
          shouldSaveDecision,
          decision,
          decisionActivity,
          administrativeUnit: currentOrganization,
        });
      }
      this.router.transitionTo(
        'administrative-units.administrative-unit.change-events.details',
        changeEvent.id
      );
    }
  }

  reset() {
    this.model.changeEvent.reset();
    this.model.decision?.reset();
    this.model.decisionActivity.reset();
    this.model.administrativeUnit.reset();
  }
}

async function createChangeEventResult({
  resultingStatusId,
  resultingOrganization,
  changeEvent,
  store,
}) {
  let resultingStatus = await store.findRecord(
    'organization-status-code',
    resultingStatusId
  );

  let mostRecentChangeEvent = await findMostRecentChangeEvent(
    store,
    resultingOrganization
  );

  if (
    !mostRecentChangeEvent ||
    mostRecentChangeEvent.date <= changeEvent.date
  ) {
    // This is the first change event or the new change event is newer
    // so we should update the organization status as well
    resultingOrganization.organizationStatus = resultingStatus;
    await resultingOrganization.save();
  }

  let changeEventResult = store.createRecord('change-event-result');
  changeEventResult.status = resultingStatus;
  changeEventResult.resultingOrganization = resultingOrganization;
  changeEventResult.resultFrom = changeEvent;
  await changeEventResult.save();
}

async function findMostRecentChangeEvent(store, organization) {
  let mostRecentChangeEventResults = await store.query('change-event-result', {
    'filter[resulting-organization][:id:]': organization.id,
    include: ['result-from', 'resulting-organization'].join(),
    page: {
      size: 1,
    },
    sort: '-result-from.date',
  });

  if (mostRecentChangeEventResults.length > 0) {
    return await mostRecentChangeEventResults.firstObject.resultFrom;
  } else {
    return null;
  }
}

async function mergeAssociated(ctx) {
  let { store, changeEvent, shouldSaveDecision, decision, decisionActivity } =
    ctx;

  const results = await changeEvent.results;

  decision = await decision;
  decisionActivity = await decisionActivity;

  let associatedChangeEvent = store.createRecord('change-event');
  let associatedDecision = store.createRecord('decision');
  let associatedDecisionActivity = store.createRecord('decisionActivity');

  //copy decision
  associatedDecision.publicationDate = decision.publicationDate;
  associatedDecision.documentLink = decision.documentLink;

  associatedDecisionActivity.endDate = decisionActivity.endDate;

  // copy changeEvent
  associatedChangeEvent.date = changeEvent.date;
  associatedChangeEvent.description = changeEvent.description;

  associatedChangeEvent.type = changeEvent.type;

  await associatedChangeEvent.save();

  await saveDecision(
    shouldSaveDecision,
    associatedDecision,
    associatedDecisionActivity
  );

  for (const org of changeEvent.originalOrganizations.toArray()) {
    const unit = await org.isAssociatedWith;
    associatedChangeEvent.originalOrganizations.pushObject(unit);
  }

  for (const org of changeEvent.resultingOrganizations.toArray()) {
    const unit = await org.isAssociatedWith;
    associatedChangeEvent.resultingOrganizations.pushObject(unit);
  }

  const createChangeEventResults = [];

  for (const r of results.toArray()) {
    const result = await r;
    const resultingOrganization = await result.resultingOrganization;
    const associatedOrg = await resultingOrganization.isAssociatedWith;
    createChangeEventResults.push(
      createChangeEventResult({
        resultingStatusId: result.status.get('id'),
        resultingOrganization: associatedOrg,
        changeEvent: associatedChangeEvent,
        store,
      })
    );
  }
  await Promise.all(createChangeEventResults);
  await associatedChangeEvent.save();
}

async function saveDecision(shouldSaveDecision, decision, decisionActivity) {
  if (shouldSaveDecision) {
    if (!decision.isEmpty || decisionActivity.endDate) {
      if (decisionActivity.endDate) {
        await decisionActivity.save();
        decision.hasDecisionActivity = decisionActivity;
      }
      await decision.save();
      return decision;
    }
  } else {
    return null;
  }
}
