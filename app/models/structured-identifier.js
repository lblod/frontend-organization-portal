import { attr } from '@ember-data/model';
import Joi from 'joi';
import AbstractValidationModel from './abstract-validation-model';
import { validateKBO } from '../validators/schema';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';

export default class StructuredIdentifierModel extends AbstractValidationModel {
  @attr localId;

  get validationSchema() {
    return Joi.object({
      //TODO: Move validation in IdentifierModel and add SharepointValidation
      localId: validateKBO().external(async (value, helpers) => {
        const changedAttributes = helpers?.prefs?.context?.changedAttributes;
        if (changedAttributes?.localId) {
          let records = await this.store.query('administrative-unit', {
            filter: {
              identifiers: {
                ':exact:id-name': ID_NAME.KBO,
                'structured-identifier': {
                  ':exact:local-id': value,
                },
              },
            },
            include: 'identifiers.structured-identifier',
          });

          if (records.length > 0) {
            return helpers.message('Dit KBO nummer is al in gebruik.', {
              administrativeUnit: records.firstObject,
            });
          }
        }

        return value;
      }),
    });
  }
}
