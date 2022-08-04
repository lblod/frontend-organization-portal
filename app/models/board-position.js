import { belongsTo, hasMany } from '@ember-data/model';
import PostModel from './post';

export default class BoardPositionModel extends PostModel {
  @belongsTo('board-position-code', {
    inverse: null,
  })
  roleBoard;

  @belongsTo('contact-point')
  contactPoint;

  @hasMany('governing-body', {
    inverse: 'boardPositions',
  })
  governingBodies;
}
