import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class UserModel extends Model {
  @attr firstName;
  @attr familyName;

  @hasMany('account', {
    inverse: 'user',
    async: false,
  })
  accounts;

  @hasMany('group', {
    inverse: null,
    async: false,
  })
  groups;

  get group() {
    return this.groups.at(0);
  }

  get fullName() {
    return `${this.firstName} ${this.familyName}`.trim();
  }
}
