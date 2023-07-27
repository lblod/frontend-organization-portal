import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class AppHeaderComponent extends Component {
  @service currentSession;
  @service session;
}
