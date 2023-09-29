import { hasMany, belongsTo } from '@ember-data/model';
import PostModel from './post';

export default class MandateModel extends PostModel {
  @belongsTo('board-position-code', {
    inverse: null,
    async: true,
  })
  roleBoard;

  @belongsTo('governing-body', {
    inverse: 'mandates',
    async: true,
  })
  governingBody;

  @hasMany('mandatory', {
    inverse: 'mandate',
    async: true,
  })
  heldBy;
}
