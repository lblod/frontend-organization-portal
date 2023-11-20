import Model, { hasMany } from '@ember-data/model';

export default class AgentModel extends Model {
  @hasMany('post', {
    inverse: null,
  })
  positions;

  @hasMany('contact-point', {
    inverse: null,
  })
  contacts;
}
