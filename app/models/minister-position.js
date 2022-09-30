import { belongsTo } from '@ember-data/model';
import PostModel from './post';

export const MAPPING_POSITION_RELIGION = {
  // ROMAN_CATHOLIC
  b13d1d623626bc1ee75c7d20bc60e3c0: [
    'ea58c73d9b4fc8a24a4b3eaa73a33995', // Coördinator
    '59837b12c14f215a4efadae950be0072', // Medepastoor
    '84b3a2321d1b69b6de782bb04e1a6862', // Aangesteld priester
    '5c7fefe1b921dfd4c550924bb7a9331d', // Pastoor
  ],
  // ANGLICAN
  '99536dd6eb0d2ef38a89efafb17e7389': [
    'fa4191f9d7050fe62ec3fc0e16541711', // Kapelaan
  ],
  // ISLAMIC
  '9d8bd472a00bf0a5c7b7186606365a52': [
    'e357bc8f4cc3a694fde2239748768a22', // Eerste Imam in rang
    'c4a3fd586211b17b06f574885e23f355', // Tweede Imam in rang
    '5ebb798bd59c3b48c25116032caa02b7', // Derde Imam in rang
  ],
  // ISRAELITE
  '1a1abeafc973d27cebcb2d7a15b2d823': [
    '17e7177aba2596705ad3c209019c729a', // Officiërend bedienaar
    '27b3d149dd2a726effe749572177682e', // Rabbijn
  ],
  // ORTHODOX
  '84bcd6896f575bae4857ff8d2764bed8': [
    'f274cb5a-ba44-4931-a1a8-38ec34513215', // Diaken
    'efbf2ff50b5c4f693f129ac03319c4f2', // Priester
    '04d3b5325f2ebc5eaf96849519af4254', // Rector
  ],
  // PROTESTANT
  e8cba1540b35a32e9cb45126c38c03c6: [
    '83d50e9184ae4a628851370079d162f6', // Predikant
  ],
};

export default class MinisterPositionModel extends PostModel {
  @belongsTo('minister-position-function', {
    inverse: null,
  })
  function;

  @belongsTo('worship-administrative-unit', {
    inverse: 'ministerPositions',
  })
  worshipService;

  @belongsTo('representative-body', {
    inverse: 'ministerPositions',
  })
  representativeBody;
}
