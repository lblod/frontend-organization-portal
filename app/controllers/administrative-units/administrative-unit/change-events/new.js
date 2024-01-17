import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';
import { isEmpty } from 'frontend-organization-portal/models/decision';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

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
  // MERGER and FUSIE aren't added here since they have multiple resulting statuses based on the resulting organization
};

export default class AdministrativeUnitsAdministrativeUnitChangeEventsNewController extends Controller {
  @service router;
  @service store;

  get hasValidationErrors() {
    return (
      this.model.decision.isInvalid ||
      this.model.formState.isInvalid ||
      this.model.changeEvent.isInvalid
    );
  }

  get isCentralWorshipService() {
    return this.model.formState.isCentralWorshipService;
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
    let selectedOriginalOrganizations =
      this.model.formState.allOriginalOrganizations;

    return searchResults.filter((organization) => {
      return !selectedOriginalOrganizations.includes(organization);
    });
  }

  get isAgbOrApb() {
    return (
      this.model.classification.id === CLASSIFICATION_CODE.AGB ||
      this.model.classification.id === CLASSIFICATION_CODE.APB
    );
  }

  get isIgs() {
    return (
      this.model.classification.id === CLASSIFICATION_CODE.PROJECTVERENIGING ||
      this.model.classification.id ===
        CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING ||
      this.model.classification.id ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING ||
      this.model.classification.id ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME
    );
  }

  get isPoliceZone() {
    return this.model.classification.id === CLASSIFICATION_CODE.POLICE_ZONE;
  }

  get isAssistanceZone() {
    return this.model.classification.id === CLASSIFICATION_CODE.ASSISTANCE_ZONE;
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
      formState,
    } = this.model;

    let shouldSaveDecision = formState.canAddDecisionInformation;

    yield formState.validate();
    yield changeEvent.validate();

    if (shouldSaveDecision) {
      yield decision.validate();
    }

    if (
      formState.isValid &&
      (shouldSaveDecision ? decision.isValid : true) &&
      changeEvent.isValid
    ) {
      changeEvent.decision = yield saveDecision(
        shouldSaveDecision,
        decision,
        decisionActivity
      );

      let changeEventType = formState.changeEventType;
      changeEvent.type = changeEventType;

      // We save the change event already so the backend assigns it an id
      // which is needed when saving the change-event-results
      yield changeEvent.save();

      if (canChangeMultipleOrganizations(changeEventType)) {
        let allOriginalOrganizations = formState.allOriginalOrganizations;
        changeEvent.originalOrganizations.pushObjects(allOriginalOrganizations);

        let createChangeEventResultsPromises = [];

        // We create change event results for all organizations that are affected by the new change event
        for (let organization of allOriginalOrganizations) {
          let resultingStatusId;

          if (
            changeEventType.id === CHANGE_EVENT_TYPE.MERGER ||
            changeEventType.id === CHANGE_EVENT_TYPE.FUSIE
          ) {
            if (formState.isCentralWorshipService) {
              resultingStatusId = ORGANIZATION_STATUS.INACTIVE;
            } else {
              resultingStatusId =
                organization === formState.resultingOrganization
                  ? ORGANIZATION_STATUS.ACTIVE
                  : ORGANIZATION_STATUS.INACTIVE;
            }
          } else {
            resultingStatusId =
              RESULTING_STATUS_FOR_CHANGE_EVENT_TYPE[changeEventType.id];
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
          changeEventType.id === CHANGE_EVENT_TYPE.MERGER ||
          changeEventType.id === CHANGE_EVENT_TYPE.FUSIE
        ) {
          changeEvent.resultingOrganizations.pushObject(
            formState.resultingOrganization
          );

          if (formState.isCentralWorshipService) {
            // Central worship services should always select a new organization as the resulting organization,
            // so we also create a change event result for that organization
            createChangeEventResultsPromises.push(
              createChangeEventResult({
                resultingStatusId: ORGANIZATION_STATUS.ACTIVE,
                resultingOrganization: formState.resultingOrganization,
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
        if (changeEventType.id !== CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED) {
          changeEvent.originalOrganizations.pushObject(currentOrganization);
        }

        if (
          ![
            CHANGE_EVENT_TYPE.RECOGNITION_LIFTED,
            CHANGE_EVENT_TYPE.RECOGNITION_NOT_GRANTED,
          ].includes(changeEventType.id)
        ) {
          changeEvent.resultingOrganizations.pushObject(currentOrganization);
        }
        yield createChangeEventResult({
          resultingStatusId:
            RESULTING_STATUS_FOR_CHANGE_EVENT_TYPE[changeEventType.id],
          resultingOrganization: currentOrganization,
          changeEvent,
          store: this.store,
        });
      }

      yield changeEvent.save(); // persist the original and resulting organization information

      if (
        (classification.id === CLASSIFICATION_CODE.MUNICIPALITY ||
          classification.id === CLASSIFICATION_CODE.OCMW) &&
        changeEventType.id === CHANGE_EVENT_TYPE.FUSIE
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
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.changeEventRecord.rollbackAttributes();
    this.model.decisionRecord.rollbackAttributes();
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

function canChangeMultipleOrganizations(changeEventType) {
  return (
    changeEventType.id === CHANGE_EVENT_TYPE.MERGER ||
    changeEventType.id === CHANGE_EVENT_TYPE.FUSIE ||
    changeEventType.id === CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE
  );
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
    if (!isEmpty(decision) || decisionActivity.endDate) {
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
