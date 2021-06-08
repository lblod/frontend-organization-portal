import Model, {hasMany, belongsTo } from '@ember-data/model';

export default class MandateModel extends Model {
    @belongsTo('board-position') roleBoard;
    @belongsTo('governing-body', { inverse: 'mandates' }) governingBody;
    @hasMany('mandatory', { inverse: 'mandate' }) heldBy;
}
