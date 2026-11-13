import Helper from '@ember/component/helper';
import { service } from '@ember/service';

/**
 * Whether the current user can only read the organisation data, see
 * `rvs-organization-edits`.
 */
export default class ReadOnlyHelper extends Helper {
  @service rvsOrganizationEdits;

  compute() {
    return this.rvsOrganizationEdits.isReadOnly;
  }
}
