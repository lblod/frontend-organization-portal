import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class EditsDisabledMessageComponent extends Component {
  @service organizationEdits;

  get isShown() {
    return this.organizationEdits.isReadOnly;
  }
}
