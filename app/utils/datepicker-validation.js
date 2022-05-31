export const EMPTY_DATE = 'EMPTY_DATE';
export const INVALID_DATE = 'INVALID_DATE';
export const MIN_DATE = 'MIN_DATE';
export const MAX_DATE = 'MAX_DATE';

export function validate(validation, allowEmpty = true) {
  if (!validation.valid) {
    switch (validation.error) {
      case INVALID_DATE: {
        return {
          valid: false,
          errorMessage: 'Invalid date',
        };
      }
      case MIN_DATE: {
        return {
          valid: false,
          errorMessage: 'min date invalid',
        };
      }
      case MAX_DATE: {
        return {
          valid: false,
          errorMessage: 'max date invalid',
        };
      }
      case EMPTY_DATE: {
        return { valid: allowEmpty };
      }
    }
  } else {
    return { valid: true };
  }
}
