import Model, { attr, belongsTo } from '@ember-data/model';

export default class ChangeEventModel extends Model {
  @attr date;
  @attr description;
  @belongsTo('change-event-type') type;
}
