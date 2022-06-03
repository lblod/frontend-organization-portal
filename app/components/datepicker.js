import Component from '@glimmer/component';
import { action } from '@ember/object';

import {
  EMPTY_DATE,
  INVALID_DATE,
  MIN_DATE,
  MAX_DATE,
  formatNl,
} from 'frontend-organization-portal/utils/datepicker';

export default class DatepickerComponent extends Component {
  constructor() {
    super(...arguments);
  }

  @action
  onChange(dt) {
    let { date, validation } = this.validate(dt);
    if (validation.valid || validation.error === EMPTY_DATE) {
      this.args.onChange?.(date);
    }
    this.args.onValidate?.(validation);
  }

  get value() {
    const { date } = this.validate(this.args.value);
    if (date instanceof Date) {
      return formatNl(date);
    }
    return date;
  }

  validate(dt) {
    let date;
    if (!dt) {
      return { date: null, validation: { valid: false, error: EMPTY_DATE } };
    }
    if (dt instanceof Date) {
      date = dt;
    } else {
      if (dt.length === 0) {
        return { date: null, validation: { valid: false, error: EMPTY_DATE } };
      }

      if (dt.length != 8) {
        return { date: dt, validation: { valid: false, error: INVALID_DATE } };
      }
      date = new Date(
        `${dt.substring(4, 8)}-${dt.substring(2, 4)}-${dt.substring(0, 2)}`
      );
    }
    let valid = date !== 'Invalid Date' && !isNaN(date);
    if (!valid) {
      return { date: dt, validation: { valid, error: INVALID_DATE } };
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

  get width() {
    return this.args.width || 'block';
  }
}
