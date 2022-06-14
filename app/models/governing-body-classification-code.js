import Model, { attr, belongsTo } from '@ember-data/model';

export const GOVERNING_BODY_CLASSIFICATION = {
  CHURCH_COUNCIL: '04f65457bf125b2dc59fd71917ac3d08',
  CATHEDRAL_CHURCH_COUNCIL: 'a0701624aefb115b7eda2ff39139c2dd',
  BOARD_OF_DIRECTORS: '90a9ec83cb93b9369bba7ff29d9ce5ce',
  COMMITTEE: 'b475fa47e17a8a05ae04a9e1fb9c9258',
  CHURCH_FACTORY_COUNCIL: 'af811edba97c6ec34874d0830cbb1183',
  CENTRAL_ADMINISTRATION: '4393389e99127b68e7fc11936ba92e18',
  CENTRAL_CHURCH_BOARD: '0d985699479162198b889f10e4f1a8ce',
};

export default class GoverningBodyClassificationCodeModel extends Model {
  @attr label;

  @belongsTo('administrative-unit-classification-code', { inverse: null })
  appliesWithin;
}
