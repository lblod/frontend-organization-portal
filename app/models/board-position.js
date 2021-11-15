import Model, { attr } from '@ember-data/model';

export const BOARD_POSITION = {
  WORSHIP_MEMBER: '2e021095727b2464459a63e16ebeafd2',
};

export default class BoardPositionModel extends Model {
  @attr label;
}

export function isWorshipMember(id) {
  return id === BOARD_POSITION.WORSHIP_MEMBER;
}
