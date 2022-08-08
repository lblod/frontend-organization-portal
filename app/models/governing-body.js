import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class GoverningBodyModel extends Model {
  @attr('date') startDate;
  @attr('date') endDate;

  @belongsTo('administrative-unit', {
    inverse: 'governingBodies',
  })
  administrativeUnit;

  @belongsTo('governing-body-classification-code', {
    inverse: null,
  })
  classification;

  @belongsTo('governing-body', {
    inverse: 'hasTimeSpecializations',
  })
  isTimeSpecializationOf;

  @hasMany('governing-body', {
    inverse: 'isTimeSpecializationOf',
  })
  hasTimeSpecializations;

  @hasMany('mandate', {
    inverse: 'governingBody',
  })
  mandates;

  @hasMany('board-position', {
    inverse: 'governingBodies',
  })
  boardPositions;

  get period() {
    let period = '-';
    if (this.startDate && this.endDate) {
      period =
        this.startDate.getFullYear() + ' - ' + this.endDate.getFullYear();
    } else if (this.startDate) {
      period = this.startDate.getFullYear() + ' -';
    } else if (this.endDate) {
      period = '- ' + this.endDate.getFullYear();
    }
    return period;
  }
}
