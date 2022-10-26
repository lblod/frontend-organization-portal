import Controller from '@ember/controller';
import { getOwner } from '@ember/application';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]'
);

export default class ApplicationController extends Controller {
  get environmentName() {
    if (isLocalhost) {
      return 'local';
    } else {
      return getOwner(this).resolveRegistration('config:environment')
        .environmentName;
    }
  }

  get environmentTitle() {
    if (isLocalhost) {
      return 'lokalomgeving';
    } else {
      return getOwner(this).resolveRegistration('config:environment')
        .environmentTitle;
    }
  }

  get showEnvironment() {
    return (
      this.environmentName !== '' &&
      this.environmentName !== '{{ENVIRONMENT_NAME}}'
    );
  }
}
