import Model, { attr, belongsTo } from '@ember-data/model';

export default class IdentifierModel extends Model {
    @attr idName;
    @belongsTo('structured-identifier') structuredIdentifier;
}
