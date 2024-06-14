import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { ORGANIZATION_TYPES } from '../constants/organization-types';
import { getOrganizationTypes } from '../utils/organization-type';

export default class OrganizationTypeMultipleSelectComponent extends Component {
  @service currentSession;

  get selectedOrganizationTypes() {
    let selectionArray = [];

    if (typeof this.args.selected === 'string' && this.args.selected.length) {
      selectionArray = this.args.selected.split(',');
    }

    if (selectionArray.length) {
      return selectionArray;
    }

    return this.args.selected;
  }

  get organizationTypes() {
    let selectedClassificationIds = this.args.selectedClassificationIds;

    if (selectedClassificationIds) {
      selectedClassificationIds = selectedClassificationIds.split(',');
      return getOrganizationTypes(...selectedClassificationIds);
    } else {
      return Object.values(ORGANIZATION_TYPES);
    }
  }
}
