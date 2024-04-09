import { attr, belongsTo } from '@ember-data/model';
import Joi from 'joi';
import AbstractValidationModel from './abstract-validation-model';

export const ID_NAME = {
  KBO: 'KBO nummer',
  SHAREPOINT: 'SharePoint identificator',
  SSN: 'Rijksregisternummer',
  NIS: 'NIS code',
  OVO: 'OVO-nummer',
};

export default class IdentifierModel extends AbstractValidationModel {
  @attr idName;

  @belongsTo('structured-identifier', {
    inverse: null,
    async: true,
  })
  structuredIdentifier;

  get validationSchema() {
    return Joi.object({
      idName: Joi.string()
        .empty('')
        .valid(...Object.values(ID_NAME))
        .required(),
      structuredIdentifier: Joi.object()
        .external(async (value, helpers) => {
          const { localId } = value;
          if (this.idName === ID_NAME.KBO) {
            // KBO is required
            if (!localId) {
              return helpers.message('Vul het KBO nummer in');
            }
            // KBO must be 10 digits
            if (!localId.match(/^\d{10}$/)) {
              return helpers.message('Vul het (tiencijferige) KBO nummer in.');
            }
            // KBO must be unique (valid only when changed)
            const changedAttributes = (
              await this.structuredIdentifier
            ).changedAttributes();
            if (changedAttributes?.localId) {
              let records = await this.store.query('administrative-unit', {
                filter: {
                  identifiers: {
                    ':exact:id-name': ID_NAME.KBO,
                    'structured-identifier': {
                      ':exact:local-id': localId,
                    },
                  },
                },
                include: 'identifiers.structured-identifier',
              });

              if (records.length > 0) {
                return helpers.message('Dit KBO nummer is al in gebruik.', {
                  administrativeUnit: records.at(0),
                });
              }
            }
          }

          if (this.idName === ID_NAME.SHAREPOINT) {
            // SharePoint must be empty or digits
            const changedAttributes = (
              await this.structuredIdentifier
            ).changedAttributes();
            if (changedAttributes?.localId && !localId.match(/^\d*$/)) {
              return helpers.message(
                'De SharePoint identificator mag enkel cijfers bevatten'
              );
            }
          }

          return value;
        })
        .required(),
    });
  }
}
