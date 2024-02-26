import { attr, belongsTo } from '@ember-data/model';
import AgentInPositionModel from './agent-in-position';

export default class FunctionaryModel extends AgentInPositionModel {
  @attr('date') startDate;
  @attr('date') endDate;

  @belongsTo('agent-status-code', {
    inverse: null,
    async: true,
  })
  status;

  @belongsTo('person', {
    inverse: 'functionaries',
    async: true,
  })
  governingAlias;

  @belongsTo('board-position', {
    inverse: null,
    async: true,
  })
  boardPosition;
}
