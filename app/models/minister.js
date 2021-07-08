import { hasMany, belongsTo } from '@ember-data/model';
import AgentInPositionModel from './agent-in-position';

export default class MinisterModel extends AgentInPositionModel {
  @belongsTo('minister-position') ministerPosition;
  @belongsTo('financiering-code') financiering;
  @hasMany('minister-condition') conditions;
}
