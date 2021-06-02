import Model, {belongsTo } from '@ember-data/model';

export default class WorshipServiceModel extends Model {
    @belongsTo('eredienst-type') eredienstType;
}
