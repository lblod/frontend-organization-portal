import Model, { belongsTo } from '@ember-data/model';

export default class PostModel extends Model {
  @belongsTo('board-position') roleBoard;
  @belongsTo('role') generalRole;
  @belongsTo('organization') organization;
}
