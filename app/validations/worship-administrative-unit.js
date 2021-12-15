import { isBlank } from '@ember/utils';
import { validatePresence } from 'ember-changeset-validations/validators';
import { ID_NAME } from 'frontend-contact-hub/models/identifier';

export default {
  name: validatePresence({ presence: true, ignoreBlank: true }),
  recognizedWorshipType: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een optie',
  }),
  classification: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een optie',
  }),
  organizationStatus: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een optie',
  }),
  isAssociatedWith: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een optie',
  }),
};

export function getStructuredIdentifierKBOValidations(store) {
  return {
    localId: validateKBO(store),
  };
}

function validateKBONumbers(newKboNumber) {
  if (!newKboNumber.match(/[^$,.\d]/) && newKboNumber.length === 10) {
    const controlDigits = parseInt(newKboNumber.substring(8, 10));
    const checksum = 97 - (parseInt(newKboNumber.substring(0, 8)) % 97);
    if (controlDigits === checksum) {
      return true;
    }
  }
  return {
    message: 'Vul het (tiencijferige) KBO nummer in.',
  };
}

function validateKBO(store) {
  return async (key, newKboNumber, currentKboNumber) => {
    if (isBlank(newKboNumber)) {
      return true;
    }

    if (newKboNumber === currentKboNumber) {
      return validateKBONumbers(newKboNumber);
    }

    let records = await store.query('worship-administrative-unit', {
      filter: {
        identifiers: {
          ':exact:id-name': ID_NAME.KBO,
          'structured-identifier': {
            ':exact:local-id': newKboNumber,
          },
        },
      },
      include: 'identifiers.structured-identifier',
    });

    if (records.length === 0) {
      return validateKBONumbers(newKboNumber);
    }

    // ember-changeset-validations doesn't support adding metadata to error messages
    // returning an object here seems to work so we use that as a workaround / hack
    return {
      message: 'Dit KBO-nummer behoort tot',
      meta: {
        administrativeUnit: records.firstObject,
      },
    };
  };
}
