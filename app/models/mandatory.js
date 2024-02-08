import { attr, hasMany, belongsTo } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';
import AgentInPositionModel from './agent-in-position';

export default class MandatoryModel extends AgentInPositionModel {
  // TODO: These are only used for validations
  // We should find a better way to solve this
  @tracked isCurrentPosition;
  @tracked role;

  @attr('date') startDate;
  @attr('date') endDate;

  @belongsTo('mandatory-status-code', {
    inverse: null,
    async: true,
  })
  status;

  @belongsTo('person', {
    inverse: 'mandatories',
    async: true,
    polymorphic: true,
    as: 'mandatory',
  })
  governingAlias;

  @belongsTo('mandate', {
    inverse: 'heldBy',
    async: true,
    polymorphic: true,
    as: 'mandatory',
  })
  mandate;

  @hasMany('contact-point', {
    inverse: null,
    async: true,
  })
  contacts;
}
