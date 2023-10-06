import Model, { attr, belongsTo } from '@ember-data/model';

export default class LocalInvolvementModel extends Model {
  @attr('number') percentage;

  @belongsTo('involvement-type', {
    inverse: null,
    async: true,
  })
  involvementType;

  @belongsTo('worship-administrative-unit', {
    inverse: 'involvements',
    async: true,
    polymorphic: true,
    as: 'local-involvement',
  })
  worshipAdministrativeUnit;

  @belongsTo('administrative-unit', {
    inverse: 'involvedBoards',
    async: true,
    polymorphic: true,
    as: 'local-involvement',
  })
  administrativeUnit;
}
