import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';
import CentralWorshipServiceModel from 'frontend-organization-portal/models/central-worship-service';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import {
  changeEventValidations,
  decisionValidations,
} from 'frontend-organization-portal/validations/change-event';
import { action } from '@ember/object';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsNewRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );
    let changeEvent = this.store.createRecord('change-event');
    let decision = this.store.createRecord('decision');
    let decisionActivity = this.store.createRecord('decisionActivity');
    let classification = await administrativeUnit.classification;

    return {
      administrativeUnit,
      changeEvent: createValidatedChangeset(
        changeEvent,
        changeEventValidations
      ),
      decision: createValidatedChangeset(decision, decisionValidations),
      decisionActivity,
      formState: new FormState({ currentOrganization: administrativeUnit }),
      changeEventRecord: changeEvent,
      decisionRecord: decision,
      classification,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);

    controller.reset();
  }
}

// This is an experiment to see if this makes validations easier.
// Instead of storing form (only) state in the records itself, we create a dedicated class for it
// Chances are high that this will get refactored once we decide on the best pattern for this.
class FormState {
  @tracked _changeEventType;
  @tracked currentOrganization;
  @tracked originalOrganizations = [];
  @tracked _resultingOrganization;
  @tracked isAddingOriginalOrganization = true;

  // We mimic the setup that ember-changeset-validations provides
  // Wrapping this class in a changeset doesn't work as expected.
  // The values aren't set on the class instance so the getters don't
  // return the correct values.
  @tracked error = {};

  constructor({ currentOrganization = null }) {
    this.currentOrganization = currentOrganization;
  }

  get isValid() {
    return Object.keys(this.error).length === 0;
  }

  get changeEventType() {
    return this._changeEventType;
  }
  set changeEventType(value) {
    this._changeEventType = value;

    if (
      this.shouldSelectMultipleOriginalOrganizations &&
      !this.isAddingOriginalOrganization &&
      this.originalOrganizations.length === 0
    ) {
      this.isAddingOriginalOrganization = true;
    }

    if (this.error?.changeEventType) {
      delete this.error.changeEventType;
      this.error = {
        ...this.error,
      };
    }

    if (this.error?.originalOrganizations) {
      delete this.error.originalOrganizations;
      this.error = {
        ...this.error,
      };
    }
  }

  get resultingOrganization() {
    return this._resultingOrganization;
  }
  set resultingOrganization(value) {
    this._resultingOrganization = value;

    if (this.error?.resultingOrganization) {
      delete this.error.resultingOrganization;
      this.error = {
        ...this.error,
      };
    }
  }

  get isCentralWorshipService() {
    return this.currentOrganization instanceof CentralWorshipServiceModel;
  }

  get canAddDecisionInformation() {
    return (
      this.changeEventType &&
      this.changeEventType.id !== CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED
    );
  }

  get isCityChangeEvent() {
    return (
      this.changeEventType && this.changeEventType.id == CHANGE_EVENT_TYPE.CITY
    );
  }

  get shouldShowExtraInformationCard() {
    let changeEventTypeId = this.changeEventType?.id;
    return (
      changeEventTypeId === CHANGE_EVENT_TYPE.MERGER ||
      changeEventTypeId === CHANGE_EVENT_TYPE.FUSIE ||
      changeEventTypeId === CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE
    );
  }

  get shouldSelectMultipleOriginalOrganizations() {
    return (
      this.changeEventType &&
      (this.changeEventType.id === CHANGE_EVENT_TYPE.MERGER ||
        this.changeEventType.id === CHANGE_EVENT_TYPE.FUSIE)
    );
  }

  get canCancelSelectingOriginalOrganization() {
    return (
      !this.shouldSelectMultipleOriginalOrganizations ||
      this.originalOrganizations.length > 0
    );
  }

  get canRemoveSelectedOriginalOrganization() {
    return (
      !this.shouldSelectMultipleOriginalOrganizations ||
      this.originalOrganizations.length > 1
    );
  }

  get shouldSelectResultingOrganization() {
    return (
      this.changeEventType?.id === CHANGE_EVENT_TYPE.MERGER ||
      this.changeEventType?.id === CHANGE_EVENT_TYPE.FUSIE
    );
  }

  get allOriginalOrganizations() {
    return [this.currentOrganization, ...this.originalOrganizations];
  }

  @action
  addOriginalOrganization(organization) {
    this.originalOrganizations = [...this.originalOrganizations, organization];
    this.isAddingOriginalOrganization = false;

    if (this.error?.originalOrganizations) {
      delete this.error.originalOrganizations;
      this.error = {
        ...this.error,
      };
    }
  }

  @action
  updateOriginalOrganization(previousOrganization, newOrganization) {
    // todo handle duplicates
    if (
      previousOrganization === newOrganization ||
      this.allOriginalOrganizations.includes(newOrganization)
    ) {
      // TODO: Should we show an error message somehow?
      return;
    }

    this.originalOrganizations = this.originalOrganizations.map(
      (organization) => {
        if (organization.id === previousOrganization.id) {
          return newOrganization;
        } else {
          return organization;
        }
      }
    );

    if (this.isCentralWorshipService) {
      if (this.resultingOrganization === newOrganization) {
        this.resultingOrganization = null;
      }
    } else {
      if (this.resultingOrganization === previousOrganization) {
        this.resultingOrganization = null;
      }
    }
  }

  @action
  removeOriginalOrganization(organization) {
    let organizations = this.originalOrganizations;
    this.originalOrganizations = organizations.filter(
      (originalOrganization) => originalOrganization.id !== organization.id
    );

    if (
      !this.isCentralWorshipService &&
      this.resultingOrganization === organization
    ) {
      this.resultingOrganization = null;
    }
  }

  validate() {
    let error = {};

    if (!this.changeEventType) {
      error.changeEventType = {
        validation: 'Selecteer een type',
      };
    }

    if (
      this.shouldSelectMultipleOriginalOrganizations &&
      this.originalOrganizations.length === 0
    ) {
      error.originalOrganizations = {
        validation: 'Selecteer een betrokken organisatie',
      };
    }

    if (this.shouldSelectResultingOrganization && !this.resultingOrganization) {
      error.resultingOrganization = {
        validation: 'Selecteer een resulterende organisatie',
      };
    }

    // todo handle original and resulting org selection

    this.error = error;
  }
}
