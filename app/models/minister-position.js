import { belongsTo } from '@ember-data/model';
import PostModel from './post';

export const CENTRAL_WORSHIP_SERVICE_MINISTER_POSITIONS_BLACKLIST = [
  '59837b12c14f215a4efadae950be0072', // Onderpastoor
  '04d3b5325f2ebc5eaf96849519af4254', // Pastoor-deken
  '158b739bc1087d5246df2fa54acff29c', // Secretaris bij het voorzitterschap van de Synode
  '691cd70183d5b234ec573800e2aa11e7', // Vervanger
  '5ebb798bd59c3b48c25116032caa02b7', // Derde Imam in rang
  '17e7177aba2596705ad3c209019c729a', // Officiërend bedienaar
  '67548f1fe5bf52e5a7ad33dcce47472d', // Kapelaan van de andere kerken
  'efbf2ff50b5c4f693f129ac03319c4f2', // Bedienaar
  'c4a3fd586211b17b06f574885e23f355', // Tweede Imam in rang
  'ea58c73d9b4fc8a24a4b3eaa73a33995', // Kapelaan
  '689b3123e29cff78e310df38a774b9bb', // Kerkbedienaar
  '27b3d149dd2a726effe749572177682e', // Rabbijn
  'e357bc8f4cc3a694fde2239748768a22', // Eerste Imam in rang
  '83d50e9184ae4a628851370079d162f6', // Eerste predikant
  '92aad8fc5cc7a13a7b0ddc7cc13c02aa', // Hulppredikant
  '85543bba7601ca598212f0feb9bdb4c2', // Predikant bij het voorzitterschap van de Synode
  '5c7fefe1b921dfd4c550924bb7a9331d', // Pastoor
  '97083de35cd36b36a72185807e941c8a', // Tweede predikant bij het voorzitterschap van de Synode
  'fa4191f9d7050fe62ec3fc0e16541711', // Kapelaan van de kerken te Antwerpen en te Elsene (Geünifieerde anglikaanse kerk)
  '84b3a2321d1b69b6de782bb04e1a6862', // Parochieassistent
];

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
