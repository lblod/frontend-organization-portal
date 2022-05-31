export const EMPTY_DATE = 'EMPTY_DATE';
export const INVALID_DATE = 'INVALID_DATE';
export const MIN_DATE = 'MIN_DATE';
export const MAX_DATE = 'MAX_DATE';

export function validate(validation, allowEmpty = true, errorMessages) {
  if (!validation.valid) {
    switch (validation.error) {
      case INVALID_DATE: {
        return {
          valid: false,
          errorMessage: errorMessages?.invalidDate || 'Ongeldige datum',
        };
      }
      case MAX_DATE: {
        return {
          valid: false,
          errorMessage:
            errorMessages?.maxDate ||
            'Kies een datum tussen 01-01-1900 en vandaag',
        };
      }
      case MIN_DATE: {
        return {
          valid: false,
          errorMessage:
            errorMessages?.minDate ||
            'Kies een datum tussen 01-01-1900 en vandaag',
        };
      }
      case EMPTY_DATE: {
        return {
          valid: allowEmpty,
          errorMessages: !allowEmpty
            ? errorMessages?.emptyDate || 'datum kan niet leeg zijn'
            : null,
        };
      }
    }
  } else {
    return { valid: true };
  }
}
