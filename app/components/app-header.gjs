import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class AppHeaderComponent extends Component {
  @service currentSession;
  @service session;
}
