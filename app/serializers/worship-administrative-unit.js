import ApplicationSerializer from './application';
export default class WorshipAdministrativeUnitSerializer extends ApplicationSerializer {
  attrs = {
    memberships: { serialize: true },
  };
}
