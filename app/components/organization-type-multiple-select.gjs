import Component from '@glimmer/component';
import { service } from '@ember/service';
import { ORGANIZATION_TYPES } from 'frontend-organization-portal/constants/organization-types';
import { getOrganizationTypes } from 'frontend-organization-portal/utils/organization-type';

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

<div class={{if @error "ember-power-select--error"}}>
  <PowerSelect
    @multiple={{true}}
    @searchEnabled={{or @searchEnabled true}}
    @allowClear={{or @allowClear true}}
    @searchField="label"
    @loadingMessage="Aan het laden..."
    @noMatchesMessage="Geen resultaten"
    @searchMessage="Typ om te zoeken"
    @options={{this.organizationTypes}}
    @selected={{this.selectedOrganizationTypes}}
    @onChange={{@onChange}}
    @triggerId={{@id}}
    as |type|
  >
    {{type}}
  </PowerSelect>
</div>