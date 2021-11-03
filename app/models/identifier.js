import Model, { attr, belongsTo } from '@ember-data/model';

export const ID_NAME = {
  KBO: 'KBO nummer',
  SHAREPOINT: 'SharePoint identificator',
  SSN: 'Rijksregisternummer',
};

export default class IdentifierModel extends Model {
  @attr idName;

  @belongsTo('structured-identifier', {
    inverse: null,
  })
  structuredIdentifier;
}
