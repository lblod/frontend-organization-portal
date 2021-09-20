import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

const environmentNames = {
  localhost: 'LOCAL',
  'dev.organisaties.abb.lblod.info': 'DEV',
  'organisaties.abb.lblod.info': 'QA',
};

export default class AppHeaderComponent extends Component {
  @service currentSession;
  @service session;

  constructor() {
    super(...arguments);

    const hostname = window.location.hostname;
    if (environmentNames[hostname]) {
      this.environmentName = environmentNames[hostname];
      this.environmentClass = `au-c-environment-pill--${this.environmentName.toLowerCase()}`;
    } else {
      this.environmentName = null;
      this.environmentClass = null;
    }
  }

  @action
  logout() {
    this.session.invalidate();
  }
}
