import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class DecisionActivityModel extends Model {
  @attr('date') endDate;

  @hasMany('decision', {
    inverse: 'hasDecisionActivity',
    async: true,
  })
  givesCauseTo;
}
