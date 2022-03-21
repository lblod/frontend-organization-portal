import Component from '@glimmer/component';
import config from 'frontend-organization-portal/config/environment';

const ENVIRONMENT_NAME = {
  LOCAL: 'LOCAL',
  DEV: 'DEV',
  QA: 'QA',
};

const ENVIRONMENT_NAME_CLASS = {
  [ENVIRONMENT_NAME.LOCAL]: 'au-c-environment-pill--local',
  [ENVIRONMENT_NAME.DEV]: 'au-c-environment-pill--dev',
  [ENVIRONMENT_NAME.QA]: 'au-c-environment-pill--qa',
};

export default class EnvironmentLabelComponent extends Component {
  get environmentName() {
    return config.environmentName;
  }

  get showEnvironmentLabel() {
    return Object.values(ENVIRONMENT_NAME).includes(this.environmentName);
  }

  get environmentClass() {
    return ENVIRONMENT_NAME_CLASS[this.environmentName];
  }
}
