import Model, { attr, belongsTo } from '@ember-data/model';


export default class PublicInvolvementModel extends Model {
    @attr percentage;
    @belongsTo('involvement-type') involvementType;
    @belongsTo('worship-service') worshipService;
}