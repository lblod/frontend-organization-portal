import ApplicationSerializer from './application';
export default class RepresentativeBodySerializer extends ApplicationSerializer {
  attrs = {
    memberships: { serialize: true },
  };
}
