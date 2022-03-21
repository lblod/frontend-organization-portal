import { validatePresence } from 'ember-changeset-validations/validators';
import { validateConditionally } from 'frontend-organization-portal/validators/validate-conditionally';
import { isWorshipMember } from '../models/board-position';

const mandatoryValidations = {
  typeHalf: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Selecteer een type helft',
    }),
    function (changes, content) {
      let role = changes.role || content.role;

      return isWorshipMember(role?.id);
    }
  ),
  startDate: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Vul de startdatum in',
  }),
  endDate: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul de effectieve einddatum in',
    }),
    function (changes, content) {
      let requiresEndDate;
      let isCurrentPosition = changes.isCurrentPosition;

      if (typeof isCurrentPosition !== 'boolean') {
        isCurrentPosition = content.isCurrentPosition;
      }

      requiresEndDate = !isCurrentPosition;
      return requiresEndDate;
    }
  ),
};

export default mandatoryValidations;

export const mandatoryWithRequiredRoleValidations = {
  ...mandatoryValidations,
  role: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een bestuursfunctie',
  }),
};
