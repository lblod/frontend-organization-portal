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

export function combineFullAddress(address) {
  let fullStreet = `${address.street || ''} ${address.number || ''} ${
    address.boxNumber || ''
  }`.trim();

  let muncipalityInformation = `${address.postcode || ''} ${
    address.municipality || ''
  }`.trim();

  if (fullStreet && muncipalityInformation) {
    return `${fullStreet}, ${muncipalityInformation}`;
  } else if (fullStreet) {
    return fullStreet;
  } else {
    return muncipalityInformation;
  }
}
