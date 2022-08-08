import Model, { attr } from '@ember-data/model';

export const INVOLVEMENT_TYPE = {
  FINANCIAL: 'ac400cc9f135ac7873fb3e551ec738c1',
  MID_FINANCIAL: '86fcbbbff764f1cba4c7e10dbbae578e',
};

export default class InvolvementTypeModel extends Model {
  @attr label;
}
