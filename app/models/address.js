import Model, { attr } from '@ember-data/model';

export default class AddressModel extends Model {
  @attr number;
  @attr boxNumber;
  @attr street;
  @attr postcode;
  @attr municipality;
  @attr province;
  @attr country;
  @attr fullAddress;
}
