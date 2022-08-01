import { belongsTo } from '@ember-data/model';
import PostModel from './post';

export default class BoardPositionModel extends PostModel {
  @belongsTo('board-position-code', {
    inverse: null,
  })
  roleBoard;

  @belongsTo('contact-point')
  contactPoint;

  @belongsTo('governing-body', {
    inverse: 'boardPositions',
  })
  governingBody;
}
