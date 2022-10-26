import Controller from '@ember/controller';
export default class ContactController extends Controller {
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
