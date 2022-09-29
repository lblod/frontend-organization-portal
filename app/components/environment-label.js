import Component from '@glimmer/component';
import config from 'frontend-organization-portal/config/environment';

const ENVIRONMENT_NAME = {
  LOCAL: 'LOCAL',
  DEV: 'DEV',
  QA: 'QA',
};

const ENVIRONMENT_NAME_CLASS = {
  [ENVIRONMENT_NAME.LOCAL]: 'au-c-environment--local',
  [ENVIRONMENT_NAME.DEV]: 'au-c-environment--dev',
  [ENVIRONMENT_NAME.QA]: 'au-c-environment--qa',
};

const ENVIRONMENT_NAME_TEXT = {
  [ENVIRONMENT_NAME.LOCAL]:
    'Dit is de lokale omgeving van het Organisatieportaal met fictieve en testgegevens. De productieomgeving met de echte data vind je op https://organisations.abb.vlaanderen.be',
  [ENVIRONMENT_NAME.DEV]:
    'Dit is de ontwikkelomgeving van het OrganisatiePortaal met fictieve en testgegevens. De productieomgeving met de echte data vind je op https://organisaties.abb.vlaanderen.be',
  [ENVIRONMENT_NAME.QA]:
    'Dit is de testomgeving</strong> van het OrganisatiePortaal met fictieve en testgegevens. De productieomgeving met de echte data vind je op https://organisaties.abb.vlaanderen.be',
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

  get environmentDescription() {
    return ENVIRONMENT_NAME_TEXT[this.environmentName];
  }
}
