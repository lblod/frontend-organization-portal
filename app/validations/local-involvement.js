import { assert } from '@ember/debug';
import {
  validateNumber,
  validatePresence,
} from 'ember-changeset-validations/validators';
import { validateConditionally } from 'frontend-contact-hub/validators/validate-conditionally';
import { INVOLVEMENT_TYPE } from 'frontend-contact-hub/models/involvement-type';

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
  involvementType: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een type betrokkenheid',
  }),
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
