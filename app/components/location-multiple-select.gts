import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { on } from '@ember/modifier';
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

interface LocationGroup {
  groupName: string;
  province?: Location;
  options: Location[];
}

interface GroupHeaderExtra {
  groups: LocationGroup[];
  filterMode: boolean;
}

interface GroupHeaderSignature {
  Args: {
    group: LocationGroup;
    select: Select;
    extra?: GroupHeaderExtra;
  };
  Blocks: {
    default: [];
  };
}

function asLocationArray(selected: unknown): Location[] {
  return Array.isArray(selected) ? (selected as Location[]) : [];
}

class LocationGroupHeader extends Component<GroupHeaderSignature> {
  uniqueId = guidFor(this);

  get filterMode(): boolean {
    return this.args.extra?.filterMode ?? false;
  }

  get fullGroup(): LocationGroup | undefined {
    return this.args.extra?.groups.find(
      (group) => group.groupName === this.args.group.groupName,
    );
  }

  get allOptionsInGroup(): Location[] {
    return this.fullGroup?.options ?? this.args.group.options;
  }

  get isGroupFullySelected() {
    const selected = asLocationArray(this.args.select.selected);
    const province = this.fullGroup?.province;

    if (this.filterMode && province) {
      return selected.some((location) => location.id === province.id);
    }

    const selectedIds = new Set(selected.map((location) => location.id));

    return this.allOptionsInGroup.every((option) =>
      selectedIds.has(option.id),
    );
  }

  @action
  toggleGroup(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const { select } = this.args;
    const selected = asLocationArray(select.selected);
    const province = this.fullGroup?.province;

    if (this.filterMode && province) {
      const newSelection = this.isGroupFullySelected
        ? selected.filter((location) => location.id !== province.id)
        : [...selected, province];

      select.actions.select(newSelection, event);
      return;
    }

    const groupOptions = this.allOptionsInGroup;
    const groupIds = new Set(groupOptions.map((option) => option.id));
    const remainingSelection = selected.filter(
      (location) => !groupIds.has(location.id),
    );

    const newSelection = this.isGroupFullySelected
      ? remainingSelection
      : [...remainingSelection, ...groupOptions];

    select.actions.select(newSelection, event);
  }

  <template>
    <li
      class="ember-power-select-group"
      role="group"
      aria-labelledby={{this.uniqueId}}
    >
      <button
        type="button"
        class="ember-power-select-group-name location-multiple-select__group-toggle"
        id={{this.uniqueId}}
        {{on "click" this.toggleGroup}}
      >
        {{@group.groupName}}
      </button>
      {{yield}}
    </li>
  </template>
}

interface Signature {
  Args: {
    selected?: Location[] | string;
    error?: boolean;
    disabled?: boolean;
    id?: string;
    onChange: (selection: Location[]) => unknown;
    // When set, clicking a province header adds/removes just the province
    // itself instead of all of its municipalities. Use this for filtering
    // organizations; leave unset (all municipalities) when creating or
    // editing an organization's werkingsgebied.
    filterMode?: boolean;
  };
}

export default class LocationMultipleSelect extends Component<Signature> {
  @service declare store: Store;

  locationsById?: Map<string, Location>;

  @cached
  get locationsPromise() {
    return this.loadLocationOptions();
  }

  get selectedLocations() {
    if (typeof this.args.selected === 'string' && this.args.selected.length) {
      return this.idsToLocations(this.args.selected.split(','));
    }

    return this.args.selected;
  }

  get resolvedGroups(): LocationGroup[] {
    const loadingState = getPromiseState(this.locationsPromise);

    return loadingState.value ?? [];
  }

  get groupHeaderExtra(): GroupHeaderExtra {
    return {
      groups: this.resolvedGroups,
      filterMode: this.args.filterMode ?? false,
    };
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

  idsToLocations(ids: string[]) {
    if (!this.locationsById) {
      const loadingState = getPromiseState(this.locationsPromise);
      if (loadingState.isPending || loadingState.isError) {
        return [];
      }

      const locationOptions = loadingState.value;
      const allLocations: Location[] = locationOptions.flatMap(
        (group): Location[] =>
          group.province ? [group.province, ...group.options] : group.options,
      );
      this.locationsById = new Map(
        allLocations.map((location) => {
          assert('Location is expected to have an id', location.id !== null);

          return [location.id, location];
        }),
      );
    }

    const locationsById = this.locationsById;
    assert(
      'this.locationsById is expected to be set at this point',
      locationsById instanceof Map,
    );

    return ids.map((id) => {
      const location = locationsById.get(id);
      assert('The location should exist', location);

      return location;
    });
  }

  onChange = (selection: Location[], select: Select) => {
    // We focus the trigger after a selection change so the user can start typing to search without having to click the trigger manually (which would then close the Select first)
    select.actions.getTriggerElement()?.focus();
    if (select.searchText) {
      // Reset the search term so the user does not have to backspace
      // It has the downside that they have to retype the term if they want to select similar options, but that seems less common
      select.actions.search('');
    }

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
        @groupComponent={{LocationGroupHeader}}
        @extra={{this.groupHeaderExtra}}
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
): LocationGroup {
  return {
    groupName: province.label,
    province,
    options: municipalities.filter((municipality) =>
      municipality.isLocatedWithin(province),
    ),
  };
}
