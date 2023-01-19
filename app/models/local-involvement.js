import Model, { attr, belongsTo } from '@ember-data/model';

export default class LocalqInvolvementModel extends Model {
  @attr('number') percentage;

  @belongsTo('involvement-type', {
    inverse: null,
  })
  involvementType;

  @belongsTo('worship-administrative-unit', {
    inverse: 'involvements',
  })
  worshipAdministrativeUnit;

  @belongsTo('administrative-unit', {
    inverse: 'involvedBoards',
  })
  administrativeUnit;
}
