import { belongsTo, hasMany } from '@ember-data/model';
import PostModel from './post';

export default class MinisterPositionModel extends PostModel {
  @belongsTo('minister-position-functions') function;
  @hasMany('minister', { inverse: 'ministerPosition' }) heldyByMinisters;
  @belongsTo('worship-service', { inverse: 'ministerPositions' })
  worshipService;
  @belongsTo('representative-body', { inverse: 'ministerPositions' })
  representativeBody;
}
