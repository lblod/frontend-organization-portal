import Controller from '@ember/controller';

export default class PeoplePersonPersonalInformationIndexController extends Controller {
  get nationalities() {
    return this.model.requestSensitiveInformation.nationalities
      .map((n) => n.nationalityLabel)
      .join(',');
  }
}
