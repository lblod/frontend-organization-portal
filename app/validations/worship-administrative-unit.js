import { validatePresence } from 'ember-changeset-validations/validators';
import { validateConditionally } from 'frontend-organization-portal/validators/validate-conditionally';
import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

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
  isSubOrganizationOf: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Selecteer een optie',
    }),
    function (changes, content) {
      let unit = null;
      if (changes.classification?.id && changes.recognizedWorshipType?.id) {
        unit = changes;
      } else {
        unit = content;
      }

      const isWorshipService =
        unit.classification?.get('id') === CLASSIFICATION_CODE.WORSHIP_SERVICE;

      const typesThatHaveACentralWorshipService = [
        RECOGNIZED_WORSHIP_TYPE.ISLAMIC,
        RECOGNIZED_WORSHIP_TYPE.ROMAN_CATHOLIC,
        RECOGNIZED_WORSHIP_TYPE.ORTHODOX,
      ];

      return (
        isWorshipService &&
        typesThatHaveACentralWorshipService.find(
          (id) => id == unit.recognizedWorshipType?.get('id')
        )
      );
    }
  ),
};
