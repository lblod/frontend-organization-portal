import { belongsTo, hasMany } from '@warp-drive/legacy/model';
import PostModel from './post';

export default class BoardPositionModel extends PostModel {
  @belongsTo('board-position-code', {
    inverse: null,
    async: true,
  })
  roleBoard;

  @belongsTo('contact-point', {
    inverse: null,
    async: true,
  })
  contactPoint;

  @hasMany('governing-body', {
    inverse: 'boardPositions',
    async: true,
  })
  governingBodies;
}
