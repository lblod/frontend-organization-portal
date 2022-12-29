import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import { dashedDateFormat } from '../utils/date-format';
export default class AgentInPositionModel extends Model {
  @attr('date') agentStartDate;
  @attr('date') agentEndDate;

  @belongsTo('post', {
    inverse: 'agentsInPosition',
  })
  position;

  @belongsTo('person', {
    inverse: 'agentsInPosition',
  })
  person;

  @hasMany('contact-point', {
    inverse: null,
  })
  contacts;

  get startDatum() {
    return dashedDateFormat(this.agentStartDate);
  }

  get eindDatum() {
    return dashedDateFormat(this.agentEndDate);
  }
}
