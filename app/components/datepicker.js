import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DatepickerComponent extends Component {
  @tracked
  _error;

  constructor() {
    super(...arguments);
  }

  @action
  onChange(dt) {
    let { date, validation } = this.validate(dt);
    this._error = validation;

    if (this._error.valid) {
      this.args.onChange?.(date);
    }
  }

  get value() {
    const { date, validation } = this.validate(this.args.value);

    if (validation.valid && date) {
      return new Intl.DateTimeFormat('nl-BE', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }).format(date);
    }
    return this.args.value;
  }

  validate(dt) {
    let date;
    if (!dt) {
      return { date: null, validation: { valid: true, error: null } };
    }
    if (dt instanceof Date) {
      date = dt;
      let valid = date !== 'Invalid Date' && !isNaN(date);
      if (!valid) {
        return { date, validation: { valid, error: INVALID_DATE } };
      }
    } else {
      if (dt.length === 0) {
        return { date: null, validation: { valid: true, error: null } };
      }

      if (dt.length != 8) {
        return { date: dt, validation: { valid: false, error: INVALID_DATE } };
      }
      date = new Date(
        `${dt.substring(4, 8)}-${dt.substring(2, 4)}-${dt.substring(0, 2)}`
      );
    }

    const min = this.args.min;
    const max = this.args.max;

    if (min && date.getTime() < min.getTime()) {
      return { date, validation: { valid: false, error: MIN_DATE } };
    }

    if (max && date.getTime() > max.getTime()) {
      return { date, validation: { valid: false, error: MAX_DATE } };
    }

    return { date, validation: { valid: true, error: null } };
  }

  get error() {
    if (this.args.error) {
      return true;
    }
    return !(!this._error || this._error.valid);
  }
}

export const EMPTY_DATE = 'EMPTY_DATE';
export const INVALID_DATE = 'INVALID_DATE';
export const MIN_DATE = 'MIN_DATE';
export const MAX_DATE = 'MAX_DATE';
