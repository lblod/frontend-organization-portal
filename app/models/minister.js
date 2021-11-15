import { hasMany, belongsTo } from '@ember-data/model';
import AgentInPositionModel from './agent-in-position';
import { tracked } from '@glimmer/tracking';

export default class MinisterModel extends AgentInPositionModel {
  // used for validations
  @tracked isCurrentPosition;

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
