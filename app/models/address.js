import Model, { attr, belongsTo } from '@ember-data/model';

export default class AddressModel extends Model {
  @attr number;
  @attr boxNumber;
  @attr street;
  @attr postcode;
  @attr municipality;
  @attr province;
  @attr addressRegisterUri;
  @attr country;
  @attr fullAddress;

  @belongsTo('concept', {
    inverse: null,
  })
  source;
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
  } else if (muncipalityInformation) {
    return muncipalityInformation;
  } else {
    return null;
  }
}

export function createAddress(store) {
  let record = store.createRecord('address');
  return record;
}
