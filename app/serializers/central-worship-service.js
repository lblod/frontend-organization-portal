import ApplicationSerializer from './application';
export default class CentralWorshipServiceSerializer extends ApplicationSerializer {
  attrs = {
    subOrganizations: { serialize: true },
  };
}
