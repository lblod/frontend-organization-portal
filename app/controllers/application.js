import Controller from '@ember/controller';
import { getOwner } from '@ember/application';
export default class ApplicationController extends Controller {
  get isLocalhost() {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]'
    ) {
      return true;
    } else {
      return false;
    }
  }

  get environment() {
    return getOwner(this).resolveRegistration('config:environment').environment;
  }

  get environmentName() {
    const thisEnvironmentValues = this.isLocalhost
      ? 'local'
      : getOwner(this).resolveRegistration('config:environment')
          .environmentName;

    return thisEnvironmentValues;
  }

  get applicationName() {
    return getOwner(this).resolveRegistration('config:environment').appName;
  }

  get showEnvironment() {
    return (
      this.environmentName !== '' &&
      this.environmentName !== '{{ENVIRONMENT_NAME}}'
    );
  }
}
