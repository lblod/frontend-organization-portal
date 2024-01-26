import { validatePresence } from 'ember-changeset-validations/validators';

// TODO: remove validations
const governingBodyValidations = (governingBodies) => {
  return {
    startDate: [
      validatePresence({
        presence: true,
        ignoreBlank: true,
        message: 'Vul de startdatum in',
      }),
      validateStartDateBeforeEndDate(governingBodies),
    ],
    endDate: [
      validatePresence({
        presence: true,
        ignoreBlank: true,
        message: 'Vul de einddatum in',
      }),
      validateEndDateAfterStartDate(governingBodies),
    ],
  };
};

export default governingBodyValidations;

function validateEndDateAfterStartDate(governingBodies) {
  return (_key, newValue, oldValue, changes, content) => {
    const endDateValue = newValue || oldValue;
    const endDate = new Date(endDateValue);
    const newStartDateValue = changes?.startDate || content.startDate;
    if (newStartDateValue) {
      const newStartDate = new Date(newStartDateValue);
      if (newStartDate.getTime() > endDate.getTime()) {
        return 'Kies een einddatum die na de startdatum plaatsvindt';
      }
      return validateNoOverlap(governingBodies, newStartDate, endDate);
    }
    return true;
  };
}
function validateStartDateBeforeEndDate(governingBodies) {
  return (_key, newValue, oldValue, changes, content) => {
    const newStartDateValue = newValue || oldValue;

    // The messages should also appear when the content of one of the fields is deleted.
    const effectiveEndDateValue = changes?.endDate || content.endDate;

    const newStartDate = new Date(newStartDateValue);

    if (effectiveEndDateValue) {
      const effectiveEndDate = new Date(effectiveEndDateValue);
      if (newStartDate.getTime() > effectiveEndDate.getTime()) {
        return 'Kies een startdatum die vóór de einddatum plaatsvindt';
      }
      return validateNoOverlap(governingBodies, newStartDate, effectiveEndDate);
    }

    return true;
  };
}

function validateNoOverlap(otherBodies, startDate, endDate) {
  if (!otherBodies || !startDate || !endDate) {
    return true; // do not validate if empty
  }
  for (const body of otherBodies) {
    if (body.startDate) {
      const otherStartDate = new Date(body.startDate).getTime();

      if (
        otherStartDate > startDate.getTime() &&
        otherStartDate < endDate.getTime()
      ) {
        return 'Geen overlap';
      }
    }
    if (body.endDate) {
      const otherEndDate = new Date(body.endDate).getTime();

      if (
        otherEndDate > startDate.getTime() &&
        otherEndDate < endDate.getTime()
      ) {
        return 'Geen overlap';
      }
    }
  }

  return true;
}
