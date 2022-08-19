import Controller from '@ember/controller';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsDetailsIndexController extends Controller {
  get isCityChangeEvent() {
    return (
      this.model.changeEvent.type &&
      this.model.changeEvent.type?.get('id') == CHANGE_EVENT_TYPE.CITY
    );
  }
}
