import Helper from '@ember/component/helper';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import isContactEditableOrganization from 'frontend-organization-portal/utils/editable-contact-data';

export default class EditableContactDataHelper extends Helper {
  @service features;

  compute(positional) {
    assert(
      'editable-contact-data expects exactly one argument',
      positional.length === 1
    );
    return (
      this.features.isEnabled('edit-contact-data') ||
      isContactEditableOrganization(positional[0])
    );
  }
}
