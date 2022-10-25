import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import config from 'frontend-organization-portal/config/environment';

const CONTACT_EMAIL = config.contactEmail;

export default class ContactController extends Controller {
  @tracked subject = null;
  contactEmail = CONTACT_EMAIL;

  subjectOptions = [
    {
      title: 'Bekijk onze handleiding',
      link: 'https://abb-vlaanderen.gitbook.io/handleiding-organisatieportaal/',
    },
    {
      title: 'Bekijk onze FAQ',
      link: 'https://abb-vlaanderen.gitbook.io/handleiding-organisatieportaal/ondersteuning/veelgestelde-vragen-faq',
    },
    {
      title: 'Bekijk ons vocabularium',
      link: 'https://abb-vlaanderen.gitbook.io/handleiding-organisatieportaal/ondersteuning/vocabularium',
    },
  ];

  issueOptions = [
    {
      title: 'Ik wil een een bug of probleem melden',
      link: 'https://binnenland.atlassian.net/servicedesk/customer/portal/13/group/30/create/157',
    },
    {
      title: 'Ik heb problemen met inloggen',
      link: 'https://binnenland.atlassian.net/servicedesk/customer/portal/13/group/30/create/154',
    },
    {
      title: 'Ik heb een verbetersuggestie',
      link: 'https://binnenland.atlassian.net/servicedesk/customer/portal/13/group/30/create/153',
    },
    {
      title: 'Ik heb nog een andere vraag',
      link: 'https://binnenland.atlassian.net/servicedesk/customer/portal/13/group/30/create/229',
    },
  ];
}
