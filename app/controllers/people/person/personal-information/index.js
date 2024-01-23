import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class PeoplePersonPersonalInformationIndexController extends Controller {
  @service router;

  get currentURL() {
    return this.router.currentURL;
  }

  get nationalities() {
    return this.model.requestSensitiveInformation.nationalities
      .map((n) => n.nationalityLabel)
      .join(', ');
  }
}
