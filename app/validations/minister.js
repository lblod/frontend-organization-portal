import { validatePresence } from 'ember-changeset-validations/validators';
import { validateConditionally } from 'frontend-organization-portal/validators/validate-conditionally';

export default {
  agentStartDate: [
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul de startdatum in',
    }),
    validateStartDateBeforeEndDate,
  ],
  agentEndDate: [
    validateConditionally(
      [
        validatePresence({
          presence: true,
          ignoreBlank: true,
          message: 'Vul de einddatum in',
        }),
      ],
      function (changes, content) {
        let requiresAgentEndDate;
        let isCurrentPosition = changes.isCurrentPosition;

        if (typeof isCurrentPosition !== 'boolean') {
          isCurrentPosition = content.isCurrentPosition;
        }

        requiresAgentEndDate = !isCurrentPosition;
        return requiresAgentEndDate;
      }
    ),
    validateEndDateAfterStartDate,
  ],
};

function validateStartDateBeforeEndDate(
  key,
  newValue,
  oldValue,
  changes,
  content
) {
  // The messages should also appear when the content of one of the fields is deleted.
  const agentEndDateValue = changes?.agentEndDate || content.agentEndDate;
  const newStartDate = new Date(newValue);

  if (agentEndDateValue) {
    const agentEndDate = new Date(agentEndDateValue);
    if (newStartDate.getTime() > agentEndDate.getTime()) {
      return 'Kies een startdatum die vóór de einddatum plaatsvindt';
    }
  }
  return true;
}

function validateEndDateAfterStartDate(
  key,
  newValue,
  oldValue,
  changes,
  content
) {
  const endDateValue = newValue || oldValue;
  const endDate = new Date(endDateValue);
  const newStartDateValue = changes?.agentStartDate || content.agentStartDate;

  if (newStartDateValue) {
    const newStartDate = new Date(newStartDateValue);
    if (newStartDate.getTime() > endDate.getTime()) {
      return 'Kies een einddatum die na de startdatum plaatsvindt';
    }
  }
  return true;
}

export const positionValidations = {
  function: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een positie.',
  }),
};
