import { isBlank } from '@ember/utils';
import { validatePresence } from 'ember-changeset-validations/validators';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import { validateConditionally } from 'frontend-organization-portal/validators/validate-conditionally';
import {
  CLASSIFICATION_CODE,
  OCMW_ASSOCIATION_CLASSIFICATION_CODES,
} from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default {
  name: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Vul de naam in',
  }),

  classification: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een optie',
  }),

  recognizedWorshipType: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Selecteer een optie',
    }),
    function (changes, content) {
      return isWorshipAdministrativeUnit(changes, content);
    }
  ),

  isAssociatedWith: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Selecteer een optie',
    }),
    function (changes, content) {
      return (
        isWorshipAdministrativeUnit(changes, content) || isApb(changes, content)
      );
    }
  ),

  hasParticipants: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Selecteer een optie',
    }),
    function (changes, content) {
      return isIGS(changes, content) || isOcmwAssociation(changes, content);
    }
  ),

  organizationStatus: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een optie',
  }),

  wasFoundedByOrganization: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Selecteer een optie',
    }),
    function (changes, content) {
      return isAgb(changes, content) || isApb(changes, content);
    }
  ),

  isSubOrganizationOf: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Selecteer een optie',
    }),
    function (changes, content) {
      return (
        isAgb(changes, content) ||
        isApb(changes, content) ||
        isIGS(changes, content) ||
        isPoliceZone(changes, content) ||
        isAssistanceZone(changes, content)
      );

      //todo this was disabled in OP-1705, as of today, this is not mandatory

      //const worshipService = isWorshipService(changes, content);
      //const worshipAdministrativeUnit = isWorshipAdministrativeUnit(
      //  changes,
      //  content
      //);
      // const province = isProvince(changes, content);

      // let unit = null;
      // if (changes.classification?.id && changes.recognizedWorshipType?.id) {
      //   unit = changes;
      // } else {
      //   unit = content;
      // }
      //
      // const typesThatHaveACentralWorshipService = [
      //   RECOGNIZED_WORSHIP_TYPE.ISLAMIC,
      //   RECOGNIZED_WORSHIP_TYPE.ROMAN_CATHOLIC,
      //   RECOGNIZED_WORSHIP_TYPE.ORTHODOX,
      // ];
      //
      // const requiresCentralWorshipService =
      //   typesThatHaveACentralWorshipService.find(
      //     (id) => id == unit.recognizedWorshipType?.get('id')
      //   );
      //
      // return (
      //   (!worshipAdministrativeUnit && !province) ||
      //   (worshipService && requiresCentralWorshipService)
      // );
    }
  ),
  expectedEndDate: validateConditionally(
    [
      // Disabling expectedEndDate required until data gets imported
      /* validatePresence({
        presence: true,
        ignoreBlank: true,
        message: 'Vul de datum in',
      }), */
      validateFutureDate,
    ],
    function (changes, content) {
      return isIGS(changes, content);
    }
  ),
};

export function getStructuredIdentifierKBOValidations(store) {
  return {
    localId: validateKBO(store),
  };
}

function isAgb(changes, content) {
  return hasClassificationId(changes, content, CLASSIFICATION_CODE.AGB);
}

function isApb(changes, content) {
  return hasClassificationId(changes, content, CLASSIFICATION_CODE.APB);
}

function isIGS(changes, content) {
  const typesThatAreIGS = [
    CLASSIFICATION_CODE.PROJECTVERENIGING,
    CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
    CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
    CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
  ];
  return hasClassificationId(changes, content, typesThatAreIGS);
}

function isPoliceZone(changes, content) {
  return hasClassificationId(changes, content, CLASSIFICATION_CODE.POLICE_ZONE);
}

function isAssistanceZone(changes, content) {
  return hasClassificationId(
    changes,
    content,
    CLASSIFICATION_CODE.ASSISTANCE_ZONE
  );
}

function isWorshipAdministrativeUnit(changes, content) {
  return (
    hasClassificationId(
      changes,
      content,
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    ) ||
    hasClassificationId(changes, content, CLASSIFICATION_CODE.WORSHIP_SERVICE)
  );
}

function isOcmwAssociation(changes, content) {
  return hasClassificationId(
    changes,
    content,
    OCMW_ASSOCIATION_CLASSIFICATION_CODES
  );
}

function hasClassificationId(changes, content, classificationId) {
  let unit = null;
  if (changes.classification?.id) {
    unit = changes;
  } else {
    unit = content;
  }
  if (Array.isArray(classificationId)) {
    return classificationId.includes(unit.classification?.get('id'));
  } else {
    return unit.classification?.get('id') === classificationId;
  }
}

function validateKBO(store) {
  return async (key, newKboNumber, currentKboNumber) => {
    if (isBlank(newKboNumber)) {
      return {
        message: 'Vul het KBO nummer in',
      };
    }

    if (newKboNumber.match(/[^$,.\d]/) || newKboNumber.length !== 10) {
      return {
        message: 'Vul het (tiencijferige) KBO nummer in.',
      };
    }

    if (newKboNumber === currentKboNumber) {
      return true;
    }

    let records = await store.query('administrative-unit', {
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

function validateFutureDate(_key, newValue) {
  if (newValue) {
    const newValueDate = new Date(newValue);
    const today = new Date();
    if (newValueDate < today) {
      return 'De datum mag niet in het verleden liggen';
    } else {
      return true;
    }
  } else {
    return true;
  }
}
