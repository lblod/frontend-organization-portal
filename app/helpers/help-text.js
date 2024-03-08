import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';

const HELP_TEXT = {
  date: 'Formaat: DD/MM/JJJJ',
  ['phone-number']: 'Bijvoorbeeld: +3211211430',
  ssn: 'Formaat: 00.00.00-000.00',
  kbo: 'Formaat: 0123.456.789',
  url: 'Bijvoorbeeld: https://www.vlaanderen.be',
  email: 'Bijvoorbeeld: mail@adres.com',
  abbName:
    'De naam wordt automatisch ingevuld. Deze naam is gelijk aan de juridische naam. Indien geen juridische naam beschikbaar is, wordt de naam uit KBO ingevuld.',
  legalName:
    'De juridische naam is de naam uit de statuten, decreet of andere juridisch regelgevende teksten of besluiten. Bij het aanmaken van de organisatie wordt deze ingegeven door ABB, daarna verhuist het beheer van deze naam naar de organisatie zelf, via de Contact app.',
};

export default helper(function helpText([key]) {
  assert(
    `{{help-text}}: No help text value found for "${key}"`,
    Boolean(HELP_TEXT[key])
  );
  return HELP_TEXT[key];
});
