import Model, { attr } from '@ember-data/model';

export default class JobErrorModel extends Model {
  @attr subject;
  @attr message;
  @attr detail;
  @attr references;
  @attr created;
  @attr creator;
}
