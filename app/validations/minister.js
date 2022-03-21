import { validatePresence } from 'ember-changeset-validations/validators';
import { validateConditionally } from 'frontend-organization-portal/validators/validate-conditionally';

export default {
  agentStartDate: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Vul de startdatum in',
  }),
  agentEndDate: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul de einddatum in',
    }),
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
};

export const positionValidations = {
  function: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een positie.',
  }),
};
