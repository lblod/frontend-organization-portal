import Model, { belongsTo, hasMany } from '@ember-data/model';

export default class PostModel extends Model {
  @belongsTo('board-position') roleBoard;
  @belongsTo('role') generalRole;
  @belongsTo('organization') organization;
  @hasMany('agent-in-position', { inverse: 'position' }) agentsInPosition;
}
