import Controller from '@ember/controller';

export default class MinisterIndexController extends Controller {
  get positionsCantBeCreatedOrEdited() {
    return new Date() >= new Date('2023-02-01');
  }
}
