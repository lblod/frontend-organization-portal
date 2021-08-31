import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const MEMBER_ROLES = [
  '2e021095727b2464459a63e16ebeafd2', // Bestuurslid van het bestuur van de eredienst
  '5972fccd87f864c4ec06bfbd20b5008b', // Bestuurslid (van rechtswege)  van het bestuur van de eredienst
  'f848fa3cc2c5fb7c581a116866293925', // Bestuurslid van het centraal bestuur van de eredienst
  '8c91c321ad477c4fc372ee36358d3ed4', // Expert van het centraal bestuur van de eredienst
  '6e26e94ea4b127eeb850fb6debe07271', // Vertegenwoordiger aangesteld door het representatief orgaan van het centraal bestuur van de eredienst
];

const OTHER_ROLES = [
  '67e6e585166cd97575b3e17ffc430a43', // Voorzitter van het bestuur van de eredienst
  '180d13930d6f1a3938e0aa7fa9990002', // Penningmeester van het bestuur van de eredienst
  '5ac134b9800b81da3c450d6b9605cef2', // Secretaris van het bestuur van de eredienst
  '5960262f753661cf84329f3afa9f7df7', // Voorzitter van het centraal bestuur van de eredienst
  'e2af0ea1a6af96cfb698ac39ad985eea', // Secretaris van het centraal bestuur van de eredienst
];

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyIndexRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  async model({ sort }) {
    let { administrativeUnit, governingBodyClassification, governingBody } =
      this.modelFor(
        'administrative-units.administrative-unit.governing-bodies.governing-body'
      );

    let query = {
      filter: {
        mandate: {
          ['governing-body']: {
            [':id:']: governingBody.id,
          },
        },
      },
      include: [
        'governing-alias',
        'mandate.governing-body',
        'mandate.role-board',
      ].join(),
      sort,
    };

    let memberMandatories = await this.store.query('worship-mandatory', {
      ...query,
      ['filter[mandate][role-board][:id:]']: MEMBER_ROLES.join(),
    });

    let otherMandatories = await this.store.query('worship-mandatory', {
      ...query,
      // mu-cl-resources doesn't support the inverse of `:id:` yet,
      // so we define all the other ids as a workaround
      // https://github.com/mu-semtech/mu-cl-resources/issues/22
      ['filter[mandate][role-board][:id:]']: OTHER_ROLES.join(),
    });

    return {
      administrativeUnit,
      governingBodyClassification,
      governingBody,
      memberMandatories,
      otherMandatories,
    };
  }
}
