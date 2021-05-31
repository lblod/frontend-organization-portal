import Model, {hasMany, belongsTo } from '@ember-data/model';

export default class MandateModel extends Model {
    @belongsTo('role-concept') role;
    @hasMany('governing-body', { inverse: null }) governingBodies;
}
