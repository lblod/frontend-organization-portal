import { attr } from '@warp-drive/legacy/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';

export default class PeriodOfTimeModel extends AbstractValidationModel {
  @attr('date') startDate;
  @attr('date') endDate;

  get isEmpty() {
    return !this.startDate && !this.endDate;
  }

  get validationSchema() {
    return Joi.object({
      startDate: Joi.date()
        .empty(null)
        .external(async (value, helpers) => {
          // Joi does not handle cyclic references, hence the external check
          if (value && this.endDate && value > this.endDate) {
            return helpers.message(
              'Kies een startdatum die vóór de einddatum plaatsvindt',
            );
          }

          return value;
        }),
      endDate: Joi.date()
        .empty(null)
        .external(async (value, helpers) => {
          // Note, Joi does not handle cyclic references properly. Therefore, we
          // check whether the end date is after the start date (if any) in this
          // external check instead of using Joi.date().min().
          if (value && this.startDate && value < this.startDate) {
            return helpers.message(
              'Kies een einddatum die na de startdatum plaatsvindt',
            );
          }

          return value;
        }),
    });
  }
}
