import { get } from '@ember/object';
import Model, { attr, hasMany } from '@ember-data/model';

export default class UserModel extends Model {
  @attr() firstName;
  @attr() familyName;
  @hasMany('account') accounts;
  @hasMany('group') groups;

  get group() {
    return get(this, 'groups.firstObject'); // eslint-disable-line ember/no-get
  }

  get fullName() {
    return `${this.firstName} ${this.familyName}`.trim();
  }
}
