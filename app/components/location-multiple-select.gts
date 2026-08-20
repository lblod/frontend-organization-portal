import { assert } from '@ember/debug';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { getPromiseState } from '@warp-drive/ember';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';
import PowerSelect, {
  type Select,
} from 'ember-power-select/components/power-select';
import type Location from 'frontend-organization-portal/models/location';
import type Store from 'frontend-organization-portal/services/store';

interface Signature {
  Args: {
    selected?: Location[] | string;
    error?: boolean;
    disabled?: boolean;
    id?: string;
    onChange: (selection: Location[]) => unknown;
  };
}

export default class LocationMultipleSelect extends Component<Signature> {
  @service declare store: Store;

  municipalities?: Map<string, Location>;

  @cached
  get locationsPromise() {
    return this.loadLocationOptions();
  }

  get selectedLocations() {
    if (typeof this.args.selected === 'string' && this.args.selected.length) {
      return this.labelsToLocations(this.args.selected.split(','));
    }

    return this.args.selected;
  }

  async loadLocationOptions() {
    const { content: provinces } = await this.store.request(
      queryBuilder<Location>('location', {
        sort: 'label',
        filter: { level: 'Provincie' },
      }),
    );

    const { content: municipalities } = await this.store.request(
      queryBuilder<Location>('location', {
        filter: { level: 'Gemeente' },
        sort: 'label',
        include: 'located-within',
        // NOTE (21/05/2025): Make sure to load all municipality locations
        page: { size: 400 },
      }),
    );

    return extractProvinceGroups(provinces, municipalities);
  }

  labelsToLocations(labels: string[]) {
    if (!this.municipalities) {
      const loadingState = getPromiseState(this.locationsPromise);
      if (loadingState.isPending || loadingState.isError) {
        return [];
      }

      const locationOptions = loadingState.value;
      this.municipalities = new Map(
        locationOptions
          .flatMap((group) => group.options)
          .map((municipality) => [municipality.label, municipality]),
      );
    }

    const municipalities = this.municipalities;
    assert(
      'this.municipalities is expected to be set at this point',
      municipalities instanceof Map,
    );

    return labels.map((label) => {
      const municipality = municipalities.get(label);
      assert('The municipality should exist', municipality);

      return municipality;
    });
  }

  onChange = (selection: Location[], select: Select) => {
    // We focus the trigger after a selection change so the user can start typing to search without having to click the trigger manually (which would then close the Select first)
    select.actions.getTriggerElement()?.focus();
    this.args.onChange(selection);
  };

  <template>
    <div class={{if @error "ember-power-select--error"}}>
      <PowerSelect
        @options={{this.locationsPromise}}
        @multiple={{true}}
        @loadingMessage="Aan het laden..."
        @noMatchesMessage="Geen resultaten"
        @searchMessage="Typ om te zoeken"
        @disabled={{@disabled}}
        @allowClear={{true}}
        @searchEnabled={{true}}
        @searchField="label"
        @closeOnSelect={{false}}
        @selected={{this.selectedLocations}}
        @onChange={{this.onChange}}
        @triggerId={{@id}}
        as |location|
      >
        {{location.label}}
      </PowerSelect>
    </div>
  </template>
}

function extractProvinceGroups(
  provinces: Location[],
  municipalities: Location[],
) {
  const provinceGroups = provinces
    .map((province) => createGroupForProvince(province, municipalities))
    .filter((group) => group.options.length > 0);

  const unlinkedMunicipalities = municipalities.filter(
    (municipality) =>
      !provinces.some((province) => municipality.isLocatedWithin(province)),
  );

  if (unlinkedMunicipalities.length > 0) {
    provinceGroups.push({
      groupName: 'Buiten Vlaams Gewest',
      options: unlinkedMunicipalities,
    });
  }

  return provinceGroups;
}

function createGroupForProvince(
  province: Location,
  municipalities: Location[],
) {
  return {
    groupName: province.label,
    options: municipalities.filter((municipality) =>
      municipality.isLocatedWithin(province),
    ),
  };
}
