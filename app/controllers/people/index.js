import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class PeopleIndexController extends Controller {
  @service router;

  page = 0;
  size = 20;

}