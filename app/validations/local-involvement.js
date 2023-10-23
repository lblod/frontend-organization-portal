import { assert } from '@ember/debug';
import {
  validateNumber,
  validatePresence,
} from 'ember-changeset-validations/validators';
import { validateConditionally } from 'frontend-organization-portal/validators/validate-conditionally';
import { INVOLVEMENT_TYPE } from 'frontend-organization-portal/models/involvement-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

const PERCENTAGE_ERROR_MESSAGE = {
  ['notANumber']: 'Vul het percentage in',
  ['greaterThan']: 'Het percentage moet groter zijn dan 0',
  ['lessThanOrEqualTo']: 'Het percentage mag niet groter zijn dan 100',
};

export default {
  administrativeUnit: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een lokaal bestuur',
  }),
  involvementType: [
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Selecteer een type betrokkenheid',
    }),
    validateConditionally(validateInvolvementType, isProvince),
  ],
  percentage: validateConditionally(
    validateNumber({
      gt: 0,
      lte: 100,
      message: (key, type) => {
        let errorMessage = PERCENTAGE_ERROR_MESSAGE[type];

        assert(
          `percentage: No error message found for the "${type}" validator`,
          typeof errorMessage === 'string'
        );

        return errorMessage;
      },
    }),
    isFinancialInvolvementType
  ),
};

async function isFinancialInvolvementType(changes, content) {
  let involvementType = await changes.involvementType;

  if (!isInvolvementTypeRecord(involvementType)) {
    involvementType = await content.involvementType;
  }

  if (isInvolvementTypeRecord(involvementType)) {
    return involvementType.id === INVOLVEMENT_TYPE.FINANCIAL;
  } else {
    return false;
  }
}

function isInvolvementTypeRecord(maybeRecord) {
  return maybeRecord?.constructor?.modelName === 'involvement-type';
}

async function isProvince(changes, content) {
  let unit = await changes.administrativeUnit;

  if (!unit?.classification) {
    unit = await content.administrativeUnit;
  }

  const classification = await unit?.classification;
  if (classification) {
    return classification.id === CLASSIFICATION_CODE.PROVINCE;
  } else {
    return false;
  }
}

async function validateInvolvementType(
  key,
  newValue,
  oldValue,
  changes,
  content
) {
  const ADVISEREND_TYPE = '0f845f00ee76099c89518cbaf6a7b77f';
  let involvementType = await changes.involvementType;

  if (!isInvolvementTypeRecord(involvementType)) {
    involvementType = await content.involvementType;
  }
  if (involvementType.id === ADVISEREND_TYPE) {
    return 'Adviserend is geen geldige keuze voor een provincie';
  }

  return true;
}
