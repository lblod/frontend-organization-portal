import Component from '@glimmer/component';

const SHORT_BE_NUMBER_LENGTH = 9; // Belgian landline numbers are at least 9 digits long
const LONG_INTL_NUMBER_LENGTH = 12; // Mobile phone numbers in international notation are 12 characters, including the +

export default class PhoneInput extends Component {
  get warningMessage() {
    const phone = this.args.value;

    if (!phone) {
      return undefined;
    }

    if (phone.length < SHORT_BE_NUMBER_LENGTH) {
      return 'Dit telefoonnummer lijkt ongebruikelijk kort. Controleer of het correct is ingevuld.';
    }

    if (phone.length > LONG_INTL_NUMBER_LENGTH) {
      return 'Dit telefoonnummer lijkt ongebruikelijk lang. Controleer of het correct is ingevuld.';
    }

    if (!isInternationalNumber(phone)) {
      return 'Gebruik bij voorkeur de internationale notatie.';
    }

    return undefined;
  }

  onUpdate = (event) => {
    this.args.onUpdate?.(event.target.value);
  };
}

function isInternationalNumber(phone) {
  const BASIC_INTL_FORMAT_REGEX = /\+\d*/;
  return BASIC_INTL_FORMAT_REGEX.test(phone);
}
