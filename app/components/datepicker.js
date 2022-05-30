import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DatepickerComponent extends Component {
  @tracked
  hasError;

  constructor() {
    super(...arguments);
    this.hasError = this.args.error;
  }

  @action
  onChange(date) {
    if (date?.length != 8) {
      this.hasError = true;
    } else {
      date = new Date(
        `${date.substring(4, 8)}-${date.substring(2, 4)}-${date.substring(
          0,
          2
        )}`
      );
      this.hasError = !this.isValidDate(date);
    }
    if (!this.hasError) {
      this.args.onChange?.(date);
    }
  }

  get value() {
    if (this.isValidDate(this.args.value)) {
      return new Intl.DateTimeFormat('nl-BE', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }).format(this.args.value);
    }
    return this.args.value;
  }
  isValidDate(date) {
    let isDate =
      date instanceof Date && date !== 'Invalid Date' && !isNaN(date);

    if (!isDate) {
      return false;
    }

    const min = this.args.min;
    const max = this.args.max;

    if (min && date.getTime() < min.getTime()) {
      return false;
    }

    if (max && date.getTime() > max.getTime()) {
      return false;
    }

    return isDate;
  }
}
