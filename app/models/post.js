import Model, { belongsTo } from '@warp-drive/legacy/model';

export default class PostModel extends Model {
  @belongsTo('role', {
    inverse: null,
    async: true,
  })
  generalRole;

  @belongsTo('organization', {
    inverse: null,
    async: true,
    polymorphic: true,
  })
  organization;

  @belongsTo('agent', {
    inverse: null,
    async: true,
    polymorphic: true,
  })
  agent;
}
