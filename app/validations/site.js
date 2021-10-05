import { validatePresence } from 'ember-changeset-validations/validators';
import { validateConditionally } from 'frontend-contact-hub/validators/validate-conditionally';

export default {
  address: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    isPrimarySite
  ),
};

export const addressValidations = {
  street: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    isPrimarySite
  ),
  number: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    isPrimarySite
  ),
  postcode: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    isPrimarySite
  ),
  municipality: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    isPrimarySite
  ),
  province: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    isPrimarySite
  ),
};

async function isPrimarySite() {
  return true;
}
