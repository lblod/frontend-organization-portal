import ApplicationSerializer from './application';
export default class WorshipAdministrativeUnitSerializer extends ApplicationSerializer {
  attrs = {
    subOrganizations: { serialize: true },
  };
}
