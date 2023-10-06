import Model, { belongsTo, hasMany } from '@ember-data/model';

export default class PostModel extends Model {
  @belongsTo('role', {
    inverse: null,
    async: true,
  })
  generalRole;

  @belongsTo('organization', {
    inverse: null,
    async: true,
  })
  organization;

  @hasMany('agent-in-position', {
    inverse: 'position',
    async: true,
    polymorphic: true,
    as: 'post',
  })
  agentsInPosition;
}
