import Model, { attr, belongsTo } from '@ember-data/model';

export default class AccountModel extends Model {
  @attr identifier;
  @attr provider;

  @belongsTo('user', {
    inverse: 'accounts',
    async: false,
  })
  user;
}
