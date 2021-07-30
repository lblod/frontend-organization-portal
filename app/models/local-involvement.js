import Model, { attr, belongsTo } from '@ember-data/model';

export default class PublicInvolvementModel extends Model {
  @attr percentage;

  @belongsTo('involvement-type', {
    inverse: null,
  })
  involvementType;

  @belongsTo('worship-service', {
    inverse: 'involvements',
  })
  worshipService;

  @belongsTo('administrative-unit', {
    inverse: 'involvedBoards',
  })
  administrativeUnit;
}
