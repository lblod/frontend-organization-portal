import Controller from '@ember/controller';

export default class ErrorController extends Controller {
  get is404Error() {
    console.log(this.model);
    return true;
  }
}
