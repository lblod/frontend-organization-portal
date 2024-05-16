import { inject as service } from '@ember/service';
import RedirectHandler from './redirect-handler';

export default class OrganizationRedirectHandler extends RedirectHandler {
  @service router;

  redirect(uuid) {
    this.router.replaceWith('organizations.organization', uuid);
  }
}
