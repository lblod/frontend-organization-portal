import { hasMany, belongsTo } from '@ember-data/model';
import AgentInPositionModel from './agent-in-position';
import { tracked } from '@glimmer/tracking';

export default class MinisterModel extends AgentInPositionModel {
  // used for validations
  @tracked isCurrentPosition;

  @belongsTo('minister-position', {
    inverse: 'heldByMinisters',
    async: true,
  })
  ministerPosition;

  @belongsTo('financing-code', {
    inverse: null,
    async: true,
  })
  financing;

  @hasMany('minister-condition', {
    inverse: null,
    async: true,
  })
  conditions;
}
