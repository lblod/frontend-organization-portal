import Model, { attr } from '@ember-data/model';

export const RECOGNIZED_WORSHIP_TYPE = {
  ROMAN_CATHOLIC: 'b13d1d623626bc1ee75c7d20bc60e3c0',
  ANGLICAN: '99536dd6eb0d2ef38a89efafb17e7389',
  ISLAMIC: '9d8bd472a00bf0a5c7b7186606365a52',
  ISRAELITE: '1a1abeafc973d27cebcb2d7a15b2d823',
  ORTHODOX: '84bcd6896f575bae4857ff8d2764bed8',
  PROTESTANT: 'e8cba1540b35a32e9cb45126c38c03c6',
};

export const CENTRAL_WORSHIP_SERVICE_BLACKLIST = [
  '1a1abeafc973d27cebcb2d7a15b2d823', // Israëlitisch
  '99536dd6eb0d2ef38a89efafb17e7389', // Anglicaans
  'e8cba1540b35a32e9cb45126c38c03c6', // Protestants
];

export default class RecognizedWorshipTypeModel extends Model {
  @attr label;
}
