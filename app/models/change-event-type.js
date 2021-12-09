import Model, { attr } from '@ember-data/model';

export const CHANGE_EVENT_TYPE = {
  MERGER: 'd7bbc0ea17fccf7ea35c552d757c905f',
  AREA_DESCRIPTION_CHANGE: '9f19f14910245f9b14737f1f1a2067f2',
};

export default class ChangeEventTypeModel extends Model {
  @attr label;
}
