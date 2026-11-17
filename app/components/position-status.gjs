import Component from '@glimmer/component';
import { isActivePosition } from 'frontend-organization-portal/utils/position';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';

export default class PositionStatusComponent extends Component {
  get isActivePosition() {
    let endDate = this.args.endDate;
    return isActivePosition(endDate);
  }

  <template>
    <AuPill @skin={{if this.isActivePosition "success" "error"}}>
      {{if this.isActivePosition "Actief" "Niet actief"}}
    </AuPill>
  </template>
}
