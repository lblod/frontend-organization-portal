import { assert } from '@ember/debug';
import Component from '@glimmer/component';

export default class MandatoryStatusComponent extends Component {
  get isActiveMandatory() {
    let endDate = this.args.mandatory.endDate;

    if (!endDate) {
      // No end date set, so the mandatory is still active
      return true;
    } else {
      return isDateInTheFuture(endDate);
    }
  }
}

function isDateInTheFuture(date) {
  assert('endDate should be a Date instance', date instanceof Date);
  let today = new Date();

  return date - today >= 0;
}
