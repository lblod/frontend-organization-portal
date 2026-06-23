import Model, { attr } from '@ember-data/model';
export default class LegalFormCodeModel extends Model {
  @attr label;
  @attr('number') order;
}
