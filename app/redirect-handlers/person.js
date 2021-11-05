import { inject as service } from '@ember/service';
import RedirectHandler from './redirect-handler';

export default class PersonRedirectHandler extends RedirectHandler {
  @service router;

  redirect(uuid) {
    this.router.replaceWith('people.person', uuid);
  }
}
