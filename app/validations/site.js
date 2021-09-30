import { validatePresence } from 'ember-changeset-validations/validators';
import { validateConditionally } from 'frontend-contact-hub/validators/validate-conditionally';
export default {
  address: {
    street: validateConditionally(
      validatePresence({
        presence: true,
        ignoreBlank: true,
        message: 'Vul het volledige adres in.',
      }),
      isPrimarySite
    ),
    number: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    postcode: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    municipality: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    province: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
  },
};

async function isPrimarySite() {
  return true;
}
