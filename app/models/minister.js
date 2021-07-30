import { hasMany, belongsTo } from '@ember-data/model';
import AgentInPositionModel from './agent-in-position';

export default class MinisterModel extends AgentInPositionModel {
  @belongsTo('minister-position', {
    inverse: null,
  })
  ministerPosition;

  @belongsTo('financing-code', {
    inverse: null,
  })
  financing;

  @hasMany('minister-condition', {
    inverse: null,
  })
  conditions;
}
