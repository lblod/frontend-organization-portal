import { isBlank } from '@ember/utils';
import { validatePresence } from 'ember-changeset-validations/validators';
//import { validateConditionally } from 'frontend-organization-portal/validators/validate-conditionally';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
//import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';
//import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

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
  // isSubOrganizationOf: validateConditionally(
  //   validatePresence({
  //     presence: true,
  //     ignoreBlank: true,
  //     message: 'Selecteer een optie',
  //   }),
  //   function (changes, content) {
  //     let unit = null;
  //     if (changes.classification?.id && changes.recognizedWorshipType?.id) {
  //       unit = changes;
  //     } else {
  //       unit = content;
  //     }

  //     const isWorshipService =
  //       unit.classification?.get('id') === CLASSIFICATION_CODE.WORSHIP_SERVICE;

  //     const typesThatHaveACentralWorshipService = [
  //       RECOGNIZED_WORSHIP_TYPE.ISLAMIC,
  //       RECOGNIZED_WORSHIP_TYPE.ROMAN_CATHOLIC,
  //       RECOGNIZED_WORSHIP_TYPE.ORTHODOX,
  //     ];

  //     return (
  //       isWorshipService &&
  //       typesThatHaveACentralWorshipService.find(
  //         (id) => id == unit.recognizedWorshipType?.get('id')
  //       )
  //     );
  //   }
  // ),
};

export function getStructuredIdentifierKBOValidations(store) {
  return {
    localId: validateKBO(store),
  };
}

function validateKBO(store) {
  return async (key, newKboNumber, currentKboNumber) => {
    if (isBlank(newKboNumber)) {
      return true;
    }

    if (newKboNumber.match(/[^$,.\d]/) || newKboNumber.length !== 10) {
      return {
        message: 'Vul het (tiencijferige) KBO nummer in.',
      };
    }

    if (newKboNumber === currentKboNumber) {
      return true;
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
      return true;
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
