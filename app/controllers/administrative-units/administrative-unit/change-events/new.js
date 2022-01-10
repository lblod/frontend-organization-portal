import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-contact-hub/models/administrative-unit-classification-code';
import { CHANGE_EVENT_TYPE } from 'frontend-contact-hub/models/change-event-type';
import { ORGANIZATION_STATUS } from 'frontend-contact-hub/models/organization-status-code';

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

  get classificationCodes() {
    return this.model.formState.isCentralWorshipService
      ? [CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE]
      : [CLASSIFICATION_CODE.WORSHIP_SERVICE];
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

  @dropTask
  *createNewChangeEventTask(event) {
    event.preventDefault();

    const { changeEvent, decision, formState } = this.model;

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
      if (shouldSaveDecision) {
        yield decision.save();
        changeEvent.decision = decision;
      }

      let changeEventType = formState.changeEventType;
      changeEvent.type = changeEventType;
      yield changeEvent.save();

      if (changesMultipleOrganizations(changeEventType)) {
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
        }

        yield changeEvent.save();
        yield Promise.all(createChangeEventResultsPromises);
      } else {
        yield createChangeEventResult({
          resultingStatusId:
            RESULTING_STATUS_FOR_CHANGE_EVENT_TYPE[changeEventType.id],
          resultingOrganization: formState.currentOrganization,
          changeEvent,
          store: this.store,
        });
      }

      yield changeEvent.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.change-events.details',
        changeEvent.id
      );
    }
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

  let changeEventResult = store.createRecord('change-event-result');
  changeEventResult.status = resultingStatus;
  changeEventResult.resultingOrganization = resultingOrganization;
  changeEventResult.resultFrom = changeEvent;
  await changeEventResult.save();
}

function changesMultipleOrganizations(changeEventType) {
  return (
    changeEventType.id === CHANGE_EVENT_TYPE.MERGER ||
    changeEventType.id === CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE
  );
}
