import { hasMany, belongsTo } from '@ember-data/model';
import PostModel from './post';

export default class MandateModel extends PostModel {
  @belongsTo('governing-body', { inverse: 'mandates' }) governingBody;
  @hasMany('mandatory', { inverse: 'mandate' }) heldBy;
}
