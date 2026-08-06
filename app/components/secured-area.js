import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class SecuredAreaComponent extends Component {
  @service currentSession;

  get canEdit() {
    return this.currentSession.canEdit;
  }
  get canOnlyRead() {
    return this.currentSession.canOnlyRead;
  }
}
