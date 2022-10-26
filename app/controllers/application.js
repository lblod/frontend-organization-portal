import Controller from '@ember/controller';
import { getOwner } from '@ember/application';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]'
);

export default class ApplicationController extends Controller {
  get environmentName() {
    const thisEnvironmentValues = isLocalhost
      ? 'local'
      : getOwner(this).resolveRegistration('config:environment')
          .environmentName;

    return thisEnvironmentValues;
  }

  get environmentTitle() {
    const thisEnvironmentValues = isLocalhost
      ? 'lokalomgeving'
      : getOwner(this).resolveRegistration('config:environment')
          .environmentTitle;

    return thisEnvironmentValues;
  }

  get showEnvironment() {
    return (
      this.environmentName !== '' &&
      this.environmentName !== '{{ENVIRONMENT_NAME}}'
    );
  }
}
