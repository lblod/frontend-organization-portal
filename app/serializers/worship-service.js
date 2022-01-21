import ApplicationSerializer from './application';
export default class WorshipServiceSerializer extends ApplicationSerializer {
  attrs = {
    subOrganizations: { serialize: true },
  };
}
