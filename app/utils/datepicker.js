export const EMPTY_DATE = 'EMPTY_DATE';
export const INVALID_DATE = 'INVALID_DATE';
export const MIN_DATE = 'MIN_DATE';
export const MAX_DATE = 'MAX_DATE';

export function formatNl(date) {
  return new Intl.DateTimeFormat('nl-BE', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

// TODO: remove when no longer used
export function validate(validation, allowEmpty = true, errorMessages) {
  if (!validation.valid) {
    switch (validation.error) {
      case INVALID_DATE: {
        return {
          valid: false,
          errorMessage:
            errorMessages?.invalidDate || 'Geef een geldige datum in.',
        };
      }
      case MAX_DATE: {
        return {
          valid: false,
          errorMessage:
            errorMessages?.maxDate ||
            'Kies een datum die vóór 01-09-2100 plaatsvindt',
        };
      }
      case MIN_DATE: {
        return {
          valid: false,
          errorMessage:
            errorMessages?.minDate ||
            'Kies een datum die na 01-01-1900 plaatsvindt.',
        };
      }
      case EMPTY_DATE: {
        return {
          valid: allowEmpty,
          errorMessage: !allowEmpty
            ? errorMessages?.emptyDate || 'Vul de datum in.'
            : null,
        };
      }
    }
  } else {
    return { valid: true };
  }
}
