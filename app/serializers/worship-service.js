import ApplicationSerializer from './application';
export default class WorshipServiceSerializer extends ApplicationSerializer {
  attrs = {
    memberships: { serialize: true },
  };
}
