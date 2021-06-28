import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class GoverningBodyModel extends Model {
  @attr('date') startDate;
  @attr('date') endDate;
  @belongsTo('administrative-unit') administrativeUnit;
  @belongsTo('governing-body-classification-code', { inverse: null })
  classification;
  @belongsTo('governing-body', { inverse: 'hasTimeSpecializations' })
  isTimeSpecializationOf;
  @hasMany('governing-body', { inverse: 'isTimeSpecializationOf' })
  hasTimeSpecializations;
  @hasMany('mandate') mandates;

  get periode() {
    let periode = '';
    if (this.startDate && this.endDate) {
      periode =
        this.startDate.getFullYear() + ' - ' + this.endDate.getFullYear();
    } else if (this.startDate) {
      periode = this.startDate.getFullYear();
    } else if (this.endDate) {
      periode = this.endDate.getFullYear();
    }
    return periode;
  }

  get status() {
    let status = '';
    if (this.endDate) {
      var today = new Date();
      if (this.endDate <= today) {
        status = '63cc561de9188d64ba5840a42ae8f0d6';
      } else {
        status = 'd02c4e12bf88d2fdf5123b07f29c9311';
      }
    }
    return status;
  }
}
