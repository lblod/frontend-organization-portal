import Model, { attr } from '@ember-data/model';

export const BOARD_POSITION = {
  WORSHIP_MEMBER: '2e021095727b2464459a63e16ebeafd2',
};

export const CENTRAL_WORSHIP_SERVICE_BOARD_POSITIONS_BLACKLIST = [
  '5972fccd87f864c4ec06bfbd20b5008b', //	Bestuurslid (van rechtswege) van het bestuur van de eredienst
  '5ac134b9800b81da3c450d6b9605cef2', //	Secretaris van het bestuur van de eredienst
  '180d13930d6f1a3938e0aa7fa9990002', //	Penningmeester van het bestuur van de eredienst
  '2e021095727b2464459a63e16ebeafd2', //	Bestuurslid van het bestuur van de eredienst
  '67e6e585166cd97575b3e17ffc430a43', //	Voorzitter van het bestuur van de eredienst
];

export const WORSHIP_SERVICE_POSITIONS_BOARD_BLACKLIST = [
  '8c91c321ad477c4fc372ee36358d3ed4', //	Expert van het centraal bestuur van de eredienst
  '6e26e94ea4b127eeb850fb6debe07271', //	Vertegenwoordiger aangesteld door het representatief orgaan van het centraal bestuur van de eredienst
  'e2af0ea1a6af96cfb698ac39ad985eea', //	Secretaris van het centraal bestuur van de eredienst
  '5960262f753661cf84329f3afa9f7df7', //	Voorzitter van het centraal bestuur van de eredienst
  'f848fa3cc2c5fb7c581a116866293925', //	Bestuurslid van het centraal bestuur van de eredienst
];

export const BESTURSLEDEN_POSITIONS_BOARD_BLACKLIST = [
  '5ac134b9800b81da3c450d6b9605cef2', //	Secretaris van het bestuur van de eredienst
  '67e6e585166cd97575b3e17ffc430a43', //	Voorzitter van het bestuur van de eredienst
  'e2af0ea1a6af96cfb698ac39ad985eea', //	Secretaris van het centraal bestuur van de eredienst
  '5960262f753661cf84329f3afa9f7df7', //	Voorzitter van het centraal bestuur van de eredienst
  '180d13930d6f1a3938e0aa7fa9990002', //	Penningmeester van het bestuur van de eredienst
];

export const MANDATARISSEN_POSITIONS_BOARD_BLACKLIST = [
  '5972fccd87f864c4ec06bfbd20b5008b', //	Bestuurslid (van rechtswege) van het bestuur van de eredienst
  '2e021095727b2464459a63e16ebeafd2', //	Bestuurslid van het bestuur van de eredienst
  '8c91c321ad477c4fc372ee36358d3ed4', //	Expert van het centraal bestuur van de eredienst
  'f848fa3cc2c5fb7c581a116866293925', //	Bestuurslid van het centraal bestuur van de eredienst
  '6e26e94ea4b127eeb850fb6debe07271', //	Vertegenwoordiger aangesteld door het representatief orgaan van het centraal bestuur van de eredienst
];

export default class BoardPositionModel extends Model {
  @attr label;
}

export function isWorshipMember(id) {
  return id === BOARD_POSITION.WORSHIP_MEMBER;
}
