import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class GoverningBodyModel extends Model {
  @attr('date') startDate;
  @attr('date') endDate;

  @belongsTo('administrative-unit', {
    inverse: 'governingBodies',
    async: true,
    polymorphic: true,
    as: 'governingBody',
  })
  administrativeUnit;

  @belongsTo('governing-body-classification-code', {
    inverse: null,
    async: true,
  })
  classification;

  @belongsTo('governing-body', {
    inverse: 'hasTimeSpecializations',
    async: true,
  })
  isTimeSpecializationOf;

  @hasMany('governing-body', {
    inverse: 'isTimeSpecializationOf',
    async: true,
  })
  hasTimeSpecializations;

  @hasMany('mandate', {
    inverse: 'governingBody',
    async: true,
  })
  mandates;

  @hasMany('board-position', {
    inverse: 'governingBodies',
    async: true,
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
