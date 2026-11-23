import type Owner from '@ember/owner';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import PowerSelect from 'ember-power-select/components/power-select';
import { additionalQualificationCodesQuery } from 'frontend-organization-portal/builders/additional-qualification-codes';
import type AdditionalQualificationCode from 'frontend-organization-portal/models/additional-qualification-code';
import { ADDITIONAL_QUALIFICATIONS } from 'frontend-organization-portal/models/additional-qualification-code';
import type Store from 'frontend-organization-portal/services/store';

interface Signature {
  Args: {
    selected?: string;
    id?: string;
    allowClear?: boolean;
    error?: boolean;
    onChange: (selected: AdditionalQualificationCode[]) => void;
  };
}

export default class AdditionalQualificationsMultipleSelect extends Component<Signature> {
  @service declare store: Store;

  constructor(owner: Owner, args: Signature['Args']) {
    super(owner, args);

    void this.loadAdditionalQualificationsTask.perform();
  }

  loadAdditionalQualificationsTask = task(async () => {
    const { content: qualifications } = await this.store.request(
      additionalQualificationCodesQuery(),
    );

    // Sorts the "Geen bijkomende kwalificatie(s)" marker record last
    return qualifications.slice().sort((a, b) => {
      if (a.id === ADDITIONAL_QUALIFICATIONS.NONE) {
        return 1;
      }
      if (b.id === ADDITIONAL_QUALIFICATIONS.NONE) {
        return -1;
      }
      return 0;
    });
  });

  get selectedAdditionalQualifications() {
    const selected = this.args.selected;
    const selection: AdditionalQualificationCode[] = [];

    if (selected?.length) {
      const ids = selected.split(',');

      ids.forEach((id) => {
        const qualification = this.findQualificationById(id);
        if (qualification) {
          selection.push(qualification);
        }
      });
    }

    return selection;
  }

  findQualificationById(id: string): AdditionalQualificationCode | undefined {
    // the selection isn't known while the options are still loading
    if (this.loadAdditionalQualificationsTask.isRunning) {
      return undefined;
    }

    const qualifications =
      this.loadAdditionalQualificationsTask.last?.value ?? [];
    return qualifications.find((qualification) => qualification.id === id);
  }

  get additionalQualifications() {
    return this.loadAdditionalQualificationsTask.last?.value ?? [];
  }

  <template>
    <div class={{if @error "ember-power-select--error"}}>
      <PowerSelect
        @multiple={{true}}
        @allowClear={{@allowClear}}
        @searchEnabled={{true}}
        @searchField="label"
        @loadingMessage="Aan het laden..."
        @noMatchesMessage="Geen resultaten"
        @searchMessage="Typ om te zoeken"
        @closeOnSelect={{false}}
        @options={{this.additionalQualifications}}
        @selected={{this.selectedAdditionalQualifications}}
        @onChange={{@onChange}}
        @triggerId={{@id}}
        as |qualification|
      >
        {{qualification.label}}
      </PowerSelect>
    </div>
  </template>
}
