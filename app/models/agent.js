import { attr, belongsTo } from '@ember-data/model';
import AgentInPositionModel from './agent-in-position';
import { dashedDateFormat } from '../utils/date-format';

export default class AgentModel extends AgentInPositionModel {
  @attr('date') startDate;
  @attr('date') endDate;

  @belongsTo('agent-status-code', {
    inverse: null,
  })
  status;

  @belongsTo('person', {
    inverse: 'agents',
  })
  governingAlias;

  @belongsTo('board-position', {
    inverse: null,
  })
  boardPosition;

  get startDatum() {
    return dashedDateFormat(this.startDate);
  }

  get eindDatum() {
    return dashedDateFormat(this.endDate);
  }
}
