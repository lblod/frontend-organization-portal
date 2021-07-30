import Model, { belongsTo, hasMany } from '@ember-data/model';

export default class PostModel extends Model {
  @belongsTo('role', {
    inverse: null,
  })
  generalRole;

  @belongsTo('organization', {
    inverse: null,
  })
  organization;

  @hasMany('agent-in-position', {
    inverse: 'position',
  })
  agentsInPosition;
}
