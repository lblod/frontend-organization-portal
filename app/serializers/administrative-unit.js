import ApplicationSerializer from './application';
export default class AdministrativeUnitSerializer extends ApplicationSerializer {
  attrs = {
    subOrganizations: { serialize: true },
    hasParticipants: { serialize: true },
    // TODO: add serialisation for wasFoundedByOrganization?
  };
}
