import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { useTask } from 'ember-resources';

const CENTRAL_WORSHIP_SERVICE_POSITIONS_BLACKLIST = [
  // All minister positions
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
  // Some mandatarissen and bestuursleden positions
  '5972fccd87f864c4ec06bfbd20b5008b', //	Bestuurslid (van rechtswege) van het bestuur van de eredienst
  '5ac134b9800b81da3c450d6b9605cef2', //	Secretaris van het bestuur van de eredienst
  '180d13930d6f1a3938e0aa7fa9990002', //	Penningmeester van het bestuur van de eredienst
  '2e021095727b2464459a63e16ebeafd2', //	Bestuurslid van het bestuur van de eredienst
  '67e6e585166cd97575b3e17ffc430a43', //	Voorzitter van het bestuur van de eredienst
];

const WORSHIP_SERVICE_POSITIONS_BLACKLIST = [
  // Some mandatarissen and bestuursleden positions
  '8c91c321ad477c4fc372ee36358d3ed4', //	Expert van het centraal bestuur van de eredienst
  '6e26e94ea4b127eeb850fb6debe07271', //	Vertegenwoordiger aangesteld door het representatief orgaan van het centraal bestuur van de eredienst
  'e2af0ea1a6af96cfb698ac39ad985eea', //	Secretaris van het centraal bestuur van de eredienst
  '5960262f753661cf84329f3afa9f7df7', //	Voorzitter van het centraal bestuur van de eredienst
  'f848fa3cc2c5fb7c581a116866293925', //	Bestuurslid van het centraal bestuur van de eredienst
];

const CLASSIFICATION = {
  CENTRAL_WORSHIP_SERVICE: 'f9cac08a-13c1-49da-9bcb-f650b0604054',
  WORSHIP_SERVICE: '66ec74fd-8cfc-4e16-99c6-350b35012e86',
};

export default class PositionSelectComponent extends Component {
  @service store;

  positions = useTask(this, this.loadPositionTask, () => [
    this.args.selectedAdministrativeUnit,
  ]);

  get selectedPosition() {
    if (typeof this.args.selected === 'string') {
      return this.findPositionById(this.args.selected);
    }

    return this.args.selected;
  }

  findPositionById(id) {
    if (this.positions.isRunning) {
      return null;
    }

    let position = this.positions.value;
    return position.find((p) => p.id === id);
  }

  @task *loadPositionTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    const ministerPositions = yield this.store.findAll(
      'minister-position-function'
    );
    const mandatePositions = yield this.store.findAll('board-position');

    let positions = [
      ...ministerPositions.toArray(),
      ...mandatePositions.toArray(),
    ];

    // Filter out blacklisted data if an administrative unit is selected
    if (
      this.args.selectedAdministrativeUnit &&
      this.args.selectedAdministrativeUnit.length
    ) {
      const selectedAdministrativeUnitId = this.args.selectedAdministrativeUnit;

      const administrativeUnit = (yield this.store.query(
        'administrative-unit',
        {
          'filter[:id:]': selectedAdministrativeUnitId,
          include: 'classification',
        }
      )).firstObject;

      const classification = yield administrativeUnit.classification;

      if (classification.id == CLASSIFICATION.CENTRAL_WORSHIP_SERVICE) {
        positions = positions.filter(
          (position) =>
            !this.isIdInBlacklist(
              position.id,
              CENTRAL_WORSHIP_SERVICE_POSITIONS_BLACKLIST
            )
        );
      } else {
        // So it's CLASSIFICATION.WORSHIP_SERVICE
        positions = positions.filter(
          (position) =>
            !this.isIdInBlacklist(
              position.id,
              WORSHIP_SERVICE_POSITIONS_BLACKLIST
            )
        );
      }
    }

    return positions;
  }

  isIdInBlacklist(id, blacklist) {
    return blacklist.find((element) => element == id);
  }
}
