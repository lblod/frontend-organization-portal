import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class MandatoryModel extends Model {
  @attr('date') startDate;
  @attr('date') endDate;
  @belongsTo('mandatory-status-code') status;
  @belongsTo('person') governingAlias;
  @belongsTo('mandate') mandate;
  @hasMany('contact-point', { inverse: null }) contacts;

  get startDateFormat() {
    return this.startDate.toLocaleString();
  }

  get endDateFormat() {
    return this.endDate.toLocaleString();
  }
}
