import Component from '@glimmer/component';
import { isActivePosition } from 'frontend-organization-portal/utils/position';

export default class PositionStatusComponent extends Component {
  get isActivePosition() {
    let endDate = this.args.endDate;
    return isActivePosition(endDate);
  }
}
