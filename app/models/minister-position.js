import { belongsTo } from '@ember-data/model';
import PostModel from './post';

export default class MinisterPositionModel extends PostModel {
  @belongsTo('minister-position-function', {
    inverse: null,
  })
  function;

  @belongsTo('worship-service', {
    inverse: 'ministerPositions',
  })
  worshipService;

  @belongsTo('representative-body', {
    inverse: 'ministerPositions',
  })
  representativeBody;
}
