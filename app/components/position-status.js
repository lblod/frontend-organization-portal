import Component from '@glimmer/component';
import { isActivePosition } from 'frontend-contact-hub/utils/position';

export default class PositionStatusComponent extends Component {
  get isActivePosition() {
    let endDate = this.args.endDate;
    return isActivePosition(endDate);
  }
}
