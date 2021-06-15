import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class AgentInPositionModel extends Model {
  @attr startDate;
  @attr endDate;
  @belongsTo('post') position;
  @belongsTo('person') person;
  @hasMany('contact-point', { inverse: null }) contacts;
}
