import ApplicationSerializer from './application';
export default class AdministrativeUnitSerializer extends ApplicationSerializer {
  attrs = {
    subOrganizations: { serialize: true },
    participatesIn: { serialize: true },
    hasParticipants: { serialize: true },
  };
}
