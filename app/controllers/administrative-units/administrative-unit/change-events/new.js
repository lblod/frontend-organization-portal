import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';
import { isEmpty } from 'frontend-organization-portal/models/decision';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import { validate as validateDate } from 'frontend-organization-portal/utils/datepicker-validation';
import { tracked } from '@glimmer/tracking';

const RESULTING_STATUS_FOR_CHANGE_EVENT_TYPE = {
  [CHANGE_EVENT_TYPE.NAME_CHANGE]: ORGANIZATION_STATUS.ACTIVE,
  [CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE]: ORGANIZATION_STATUS.ACTIVE,
  [CHANGE_EVENT_TYPE.RECOGNITION_NOT_GRANTED]: ORGANIZATION_STATUS.INACTIVE,
  [CHANGE_EVENT_TYPE.RECOGNITION_LIFTED]: ORGANIZATION_STATUS.INACTIVE,
  [CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED]: ORGANIZATION_STATUS.IN_FORMATION,
  [CHANGE_EVENT_TYPE.RECOGNITION_GRANTED]: ORGANIZATION_STATUS.ACTIVE,
  [CHANGE_EVENT_TYPE.SUSPENSION_OF_RECOGNITION]: ORGANIZATION_STATUS.INACTIVE,
  [CHANGE_EVENT_TYPE.SANCTIONED]: ORGANIZATION_STATUS.ACTIVE,
  // MERGER isn't added here since it has multiple resulting statuses based on the resulting organization
};

export default class AdministrativeUnitsAdministrativeUnitChangeEventsNewController extends Controller {
  @service router;
  @service store;

  @tracked
  endDateValidation = { valid: true };
  @tracked
  publicationEndDateValidation = { valid: true };
  @tracked
  dateValidation = { valid: true };

  get isCentralWorshipService() {
    return this.model.formState.isCentralWorshipService;
  }

  get classificationCodes() {
    return this.isCentralWorshipService
      ? [CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE]
      : [CLASSIFICATION_CODE.WORSHIP_SERVICE];
  }

  // TODO: replace this with a `url-for` helper.
  get administrativeUnitCreationUrl() {
    return this.router.urlFor('administrative-units.new');
  }

  @action
  validateEndDate(validation) {
    this.endDateValidation = validateDate(validation);
  }

  @action
  validateDate(validation) {
    this.dateValidation = validateDate(validation);
  }

  @action
  validatePublicationEndDate(validation) {
    this.publicationEndDateValidation = validateDate(validation);
  }

  @action
  filterSelectedOriginalOrganizations(searchResults) {
    let selectedOriginalOrganizations =
      this.model.formState.allOriginalOrganizations;

    return searchResults.filter((organization) => {
      return !selectedOriginalOrganizations.includes(organization);
    });
  }

  @dropTask
  *createNewChangeEventTask(event) {
    event.preventDefault();

    const {
      administrativeUnit: currentOrganization,
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
      this.dateValidation.valid &&
      this.endDateValidation.valid &&
      this.publicationEndDateValidation.valid &&
      formState.isValid &&
      (shouldSaveDecision ? decision.isValid : true) &&
      changeEvent.isValid
    ) {
      if (shouldSaveDecision) {
        if (!isEmpty(decision) || decisionActivity.endDate) {
          if (decisionActivity.endDate) {
            yield decisionActivity.save();
            decision.hasDecisionActivity = decisionActivity;
          }
          yield decision.save();
          changeEvent.decision = decision;
        }
      }

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

          if (changeEventType.id === CHANGE_EVENT_TYPE.MERGER) {
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

        if (changeEventType.id === CHANGE_EVENT_TYPE.MERGER) {
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

      this.router.transitionTo(
        'administrative-units.administrative-unit.change-events.details',
        changeEvent.id
      );
    }
  }

  get dateErrorMessage() {
    return (
      this.model.changeEvent?.error?.date?.validation ||
      this.dateValidation.errorMessage
    );
  }

  reset() {
    this.endDateValidation = { valid: true };
    this.publicationEndDateValidation = { valid: true };
    this.dateValidation = { valid: true };
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
