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

  get environmentName() {
    const thisEnvironmentName = this.isLocalhost
      ? 'local'
      : getOwner(this).resolveRegistration('config:environment')
          .environmentName;

    return thisEnvironmentName;
  }

  get environmentValues() {
    let environment = this.environmentName;
    switch (environment) {
      case 'test':
        return {
          title: 'testomgeving',
          skin: 'warning',
        };
      case 'development':
        return {
          title: 'ontwikkelomgeving',
          skin: 'success',
        };
      case 'local':
        return {
          title: 'lokale omgeving',
          skin: 'error',
        };
      default:
        return {
          title: '',
          skin: 'muted',
        };
    }
  }

  get showEnvironment() {
    return (
      this.environmentName !== '' &&
      this.environmentName !== '{{ENVIRONMENT_NAME}}'
    );
  }
}
