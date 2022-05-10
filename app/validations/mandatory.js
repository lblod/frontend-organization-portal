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
  expectedEndDate: (key, newValue, oldValue, changes, content) => {
    // The messages should also appear when the content of one of the fields is deleted.
    const expectedEndDateValue = newValue || oldValue;

    if (!expectedEndDateValue) {
      return true; // not mandatory
    }
    return validateEndDateAfterStartDate(
      key,
      newValue,
      oldValue,
      changes,
      content
    );
  },
  startDate: [
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul de startdatum in',
    }),
    validateStartDateBeforeEndDate,
  ],
  endDate: validateConditionally(
    [
      validatePresence({
        presence: true,
        ignoreBlank: true,
        message: 'Vul de effectieve einddatum in',
      }),
      validateEndDateAfterStartDate,
    ],
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

function validateEndDateAfterStartDate(
  key,
  newValue,
  oldValue,
  changes,
  content
) {
  const endDateValue = newValue || oldValue;
  const endDate = new Date(endDateValue);
  const newStartDateValue = changes?.startDate || content.startDate;

  if (newStartDateValue) {
    const newStartDate = new Date(newStartDateValue);
    if (newStartDate.getTime() > endDate.getTime()) {
      return 'Kies een einddatum die na de begindatum plaatsvindt';
    }
  }
  return true;
}
function validateStartDateBeforeEndDate(
  key,
  newValue,
  oldValue,
  changes,
  content
) {
  // The messages should also appear when the content of one of the fields is deleted.
  const effectiveEndDateValue = changes?.endDate || content.endDate;
  const expectedEndDateValue =
    changes?.expectedEndDate || content.expectedEndDate;

  const newStartDate = new Date(newValue);

  if (effectiveEndDateValue) {
    const effectiveEndDate = new Date(effectiveEndDateValue);
    if (newStartDate.getTime() > effectiveEndDate.getTime()) {
      return 'Kies een startdatum die na de begindatum plaatsvindt';
    }
  }
  if (expectedEndDateValue) {
    const expectedEndDate = new Date(expectedEndDateValue);
    if (newStartDate.getTime() > expectedEndDate.getTime()) {
      return 'Kies een startdatum die na de begindatum plaatsvindt';
    }
  }
  return true;
}
export const mandatoryWithRequiredRoleValidations = {
  ...mandatoryValidations,
  role: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een bestuursfunctie',
  }),
};
