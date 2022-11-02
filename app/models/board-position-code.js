import Model, { attr, belongsTo } from '@ember-data/model';

export const BOARD_POSITION_CODE = {
  WORSHIP_MEMBER: '2e021095727b2464459a63e16ebeafd2',
};

export const BOARD_MEMBER_ROLES = [
  '2e021095727b2464459a63e16ebeafd2', // Bestuurslid van het bestuur van de eredienst
  '2962f0bd-2836-4758-9866-8ce8ea2c536f', // Bestuurslid van het bestuur van de eredienst (Kleine Helft)
  'a8b5509b-f86b-48f8-94d6-fe463a9b77e3', // Bestuurslid van het bestuur van de eredienst (Grote Helft)
  '5972fccd87f864c4ec06bfbd20b5008b', // Bestuurslid (van rechtswege)  van het bestuur van de eredienst
  'f848fa3cc2c5fb7c581a116866293925', // Bestuurslid van het centraal bestuur van de eredienst
  '8c91c321ad477c4fc372ee36358d3ed4', // Expert van het centraal bestuur van de eredienst
  '6e26e94ea4b127eeb850fb6debe07271', // Vertegenwoordiger aangesteld door het representatief orgaan van het centraal bestuur van de eredienst
  'fa0201b3-2cda-4821-a15e-350ff57d77e0', // Lid van college
  '59a90e03-4f22-4bb9-8c91-132618db4b38', // Toegevoegde schepen
  '5ab0e9b8a3b2ca7c5e000011', // Gemeenteraadslid
  '5ab0e9b8a3b2ca7c5e000017', // Lid van het Vast Bureau
  '5ab0e9b8a3b2ca7c5e000019', // Lid van het Bijzonder Comité voor de Sociale Dienst
  '5ab0e9b8a3b2ca7c5e000015', // Lid van de Raad voor Maatschappelijk Welzijn
  '5ab0e9b8a3b2ca7c5e00001b', // Districtsraadslid
  '5ab0e9b8a3b2ca7c5e00001f', // Provincieraadslid
];

export const MANDATARIES_ROLES = [
  '67e6e585166cd97575b3e17ffc430a43', // Voorzitter van het bestuur van de eredienst
  '180d13930d6f1a3938e0aa7fa9990002', // Penningmeester van het bestuur van de eredienst
  '5ac134b9800b81da3c450d6b9605cef2', // Secretaris van het bestuur van de eredienst
  '5960262f753661cf84329f3afa9f7df7', // Voorzitter van het centraal bestuur van de eredienst
  'e2af0ea1a6af96cfb698ac39ad985eea', // Secretaris van het centraal bestuur van de eredienst
  '5ab0e9b8a3b2ca7c5e000013', // Burgemeester
  '7b038cc40bba10bec833ecfe6f15bc7a', // Aangewezen burgemeester
  '5ab0e9b8a3b2ca7c5e000012', // Voorzitter van de gemeenteraad
  '5ab0e9b8a3b2ca7c5e00001a', // Voorzitter van het Bijzonder Comité voor de Sociale Dienst
  '5ab0e9b8a3b2ca7c5e000018', // Voorzitter van het Vast Bureau
  '5ab0e9b8a3b2ca7c5e00001a', // Voorzitter van het Bijzonder Comité voor de Sociale Dienst
  '5ab0e9b8a3b2ca7c5e000016', // Voorzitter van de Raad voor Maatschappelijk Welzijn
  '5ab0e9b8a3b2ca7c5e00001d', // Districtsburgemeester
  '5ab0e9b8a3b2ca7c5e00001e', // Districtsschepen
  '5ab0e9b8a3b2ca7c5e00001c', // Voorzitter van de districtsraad
  '5ab0e9b8a3b2ca7c5e000020', // Gedeputeerde
  'd7c00cd1-baf1-4346-83c0-6796c0bedd85', // Gouverneur
  '5ab0e9b8a3b2ca7c5e000027', // Voorzitter van de provincieraad
];

export default class BoardPositionCodeModel extends Model {
  @attr label;

  @belongsTo('governing-body-classification-code', { inverse: null })
  appliesTo;
}

export function isWorshipMember(id) {
  return id === BOARD_POSITION_CODE.WORSHIP_MEMBER;
}
