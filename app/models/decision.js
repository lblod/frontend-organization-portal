import Model, { attr, belongsTo } from '@ember-data/model';
import { dashedDateFormat } from '../utils/date-format';

export default class DecisionModel extends Model {
  @attr('date') publicationDate;
  @attr documentLink;

  @belongsTo('decision-activity', {
    inverse: 'givesCauseTo',
  })
  hasDecisionActivity;

  get hasPublicationDate() {
    return dashedDateFormat(this.publicationDate);
  }
}

export function isEmpty(decisionRecord) {
  return !decisionRecord.publicationDate && !decisionRecord.documentLink;
}
