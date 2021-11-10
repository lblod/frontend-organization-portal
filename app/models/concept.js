import Model, { attr } from '@ember-data/model';

export default class ConceptsModel extends Model {
  @attr label;
  @attr altLabel;
}
