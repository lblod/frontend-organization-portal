import Model, {hasMany, belongsTo } from '@ember-data/model';

export default class MandateModel extends Model {
    @belongsTo('board-position') roleBoard;
    @hasMany('governing-body', { inverse: true }) governingBodies;
    @hasMany('mandatory', { inverse: true }) heldBy;
}
