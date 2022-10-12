import Controller from '@ember/controller';
import { getOwner } from '@ember/application';

export default class ApplicationController extends Controller {
  get environmentName() {
    return getOwner(this).resolveRegistration('config:environment')
      .environmentName;
  }

  get environmentTitle() {
    return getOwner(this).resolveRegistration('config:environment')
      .environmentTitle;
  }

  get showEnvironment() {
    return (
      this.environmentName !== '' &&
      this.environmentName !== '{{ENVIRONMENT_NAME}}'
    );
  }
}
