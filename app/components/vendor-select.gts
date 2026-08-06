import type Owner from '@ember/owner';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import PowerSelect from 'ember-power-select/components/power-select';
import type Vendor from 'frontend-organization-portal/models/vendor';
import { NO_PROVENANCE_VENDOR_ID } from 'frontend-organization-portal/models/vendor';
import type Store from 'frontend-organization-portal/services/store';
import { findAll } from '@warp-drive/legacy/compat/builders';
import { getRequestState } from '@warp-drive/ember';
import { cached } from '@glimmer/tracking';

interface Signature {
  Args: {
    selected?: string;
    id: string;
    onChange?: (vendorId?: string | null) => unknown;
  };
}

export default class VendorSelect extends Component<Signature> {
  @service declare store: Store;

  constructor(owner: Owner, args: Signature['Args']) {
    super(owner, args);
  }

  get selected() {
    const state = getRequestState(this.vendorsRequest);
    if (!this.args.selected || !state.isSuccess) {
      return;
    }

    return this.vendors.find((vendor) => vendor.id === this.args.selected);
  }

  @cached
  get vendorsRequest() {
    return this.store.request(findAll<Vendor>('vendor'));
  }

  get vendors() {
    const state = getRequestState(this.vendorsRequest);

    if (state.isSuccess) {
      return [
        // Loket isn't a traditional vendor, so we create a fictional one which users can select.
        { id: NO_PROVENANCE_VENDOR_ID, name: 'Loket voor lokale besturen' },
        ...state.value.map((vendor) => {
          return { id: vendor.id, name: vendor.name };
        }),
      ];
    } else {
      return [];
    }
  }

  onChange = (selected: { id: string; name: string } | null) => {
    this.args.onChange?.(selected?.id);
  };

  <template>
    {{#let (getRequestState this.vendorsRequest) as |state|}}
      <PowerSelect
        @selected={{this.selected}}
        @options={{this.vendors}}
        @onChange={{this.onChange}}
        @searchEnabled={{true}}
        @searchField="name"
        @disabled={{state.isPending}}
        @triggerId={{@id}}
        @allowClear={{true}}
        as |vendor|
      >
        {{vendor.name}}
      </PowerSelect>
    {{/let}}
  </template>
}
