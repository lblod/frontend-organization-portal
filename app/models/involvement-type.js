import Model, { attr } from '@ember-data/model';

export const INVOLVEMENT_TYPE = {
  FINANCIAL: 'ac400cc9f135ac7873fb3e551ec738c1',
};

export default class InvolvementTypeModel extends Model {
  @attr label;
}
