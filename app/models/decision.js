import { attr, belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import { validateBelongsToOptional, validateUrl } from '../validators/schema';

export default class DecisionModel extends AbstractValidationModel {
  @attr('date') publicationDate;
  @attr documentLink;

  @belongsTo('decision-activity', {
    inverse: 'givesCauseTo',
    async: true,
  })
  hasDecisionActivity;

  get isEmpty() {
    // TODO: should this not also check for an activity?
    return !(this.publicationDate || this.documentLink);
  }

  get validationSchema() {
    return Joi.object({
      // TODO: is the date really optional?
      publicationDate: Joi.date().allow(null),
      documentLink: validateUrl('Geef een geldig internetadres in'),
      hasDecisionActivity: validateBelongsToOptional(),
    });
  }
}
