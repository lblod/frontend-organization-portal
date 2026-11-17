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

{{#if (and (has-block "edit") this.canEdit)}}
  {{yield to="edit"}}
{{/if}}

{{#if (and (has-block "readOnly") this.canOnlyRead)}}
  {{yield to="readOnly"}}
{{/if}}