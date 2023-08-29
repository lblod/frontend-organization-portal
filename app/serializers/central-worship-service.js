import ApplicationSerializer from './application';
export default class CentralWorshipServiceSerializer extends ApplicationSerializer {
  attrs = {
    memberships: { serialize: true },
  };
}
