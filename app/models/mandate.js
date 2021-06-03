import Model, {hasMany, belongsTo } from '@ember-data/model';

export default class MandateModel extends Model {
    @belongsTo('board-position') roleBoard;
    @belongsTo('governing-body', { inverse: true }) governingBody;
    @hasMany('mandatory', { inverse: true }) heldBy;
}
