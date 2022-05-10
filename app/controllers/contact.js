import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import config from 'frontend-organization-portal/config/environment';

const CONTACT_EMAIL = config.contactEmail;

export default class ContactController extends Controller {
  @tracked subject = null;
  contactEmail = CONTACT_EMAIL;

  subjectOptions = [
    'Melden van onvolledige of foutieve data',
    'Melden van een bug of probleem',
    'Een inhoudelijke vraag',
    'Een vraag over de applicatie',
    'Een suggestie voor verbetering',
    'Aanmelden',
    'Technische hulp',
  ];

  get canSend() {
    return Boolean(this.subject);
  }

  get mailto() {
    return `mailto:${CONTACT_EMAIL}?subject=${this.subject}`;
  }

  reset() {
    this.subject = null;
  }
}
