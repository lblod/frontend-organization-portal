import Helper from '@ember/component/helper';
import { service } from '@ember/service';

/**
 * Whether the current user can only read the organisation data, see
 * `organization-edits`.
 */
export default class ReadOnlyHelper extends Helper {
  @service organizationEdits;

  compute() {
    return this.organizationEdits.isReadOnly;
  }
}
