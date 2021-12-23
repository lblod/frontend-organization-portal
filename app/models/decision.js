import Model, { attr } from '@ember-data/model';

export default class DecisionModel extends Model {
  @attr('date') publicationDate;
  @attr documentLink;
}
