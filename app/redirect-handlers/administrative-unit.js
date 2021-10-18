import { inject as service } from '@ember/service';
import RedirectHandler from './redirect-handler';

export default class AdministrativeUnitRedirectHandler extends RedirectHandler {
  @service router;

  redirect(uuid) {
    this.router.replaceWith('administrative-units.administrative-unit', uuid);
  }
}
