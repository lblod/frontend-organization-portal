import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class EditsDisabledMessageComponent extends Component {
  @service rvsOrganizationEdits;

  get isShown() {
    return this.rvsOrganizationEdits.isReadOnly;
  }
}
