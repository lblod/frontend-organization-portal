import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';

export default function isAdditionalQualificationChangeEvent(changeEvent) {
  return (
    changeEvent?.type?.id === CHANGE_EVENT_TYPE.ADDITIONAL_QUALIFICATION_CHANGE
  );
}
