import Model, { attr } from '@ember-data/model';

export const REQUEST_REASON = {
  CREATION: '3aeec145-acf3-4b6e-9c00-5b8e285736e0',
  EDITION: '3beec145-acf3-4b6e-9c00-5b8e285736e4',
};

export default class RequestReasonModel extends Model {
  @attr label;
}
