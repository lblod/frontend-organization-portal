import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import AuTooltip from '@appuniversum/ember-appuniversum/components/au-tooltip';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import type Owner from '@ember/owner';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { Await } from '@warp-drive/ember';
import { query } from '@warp-drive/legacy/compat/builders';
import PowerSelect from 'ember-power-select/components/power-select';
import type AdditionalQualificationCode from 'frontend-organization-portal/models/additional-qualification-code';
import { ADDITIONAL_QUALIFICATIONS } from 'frontend-organization-portal/models/additional-qualification-code';
import type Store from 'frontend-organization-portal/services/store';

interface Signature {
  Args: {
    selected: AdditionalQualificationCode[];
    id?: string;
    error?: boolean;
    onChange: (selected: AdditionalQualificationCode[]) => void;
  };
}

export default class AdditionalQualificationsSelect extends Component<Signature> {
  @service declare store: Store;
  @tracked declare choiceValue?: string;

  optionsPromise: Promise<AdditionalQualificationCode[]>;
  _noQualificationsRecord?: AdditionalQualificationCode;

  constructor(owner: Owner, args: Signature['Args']) {
    super(owner, args);

    // Set the initial radio selection based on the selected argument we receive on initial render
    const { selected } = this.args;
    if (selected.length) {
      this.choiceValue = selected.some((qualification) => {
        return qualification.id === ADDITIONAL_QUALIFICATIONS.NONE;
      })
        ? 'no'
        : 'yes';
    }

    this.optionsPromise = this.#loadOptions();
  }

  get noQualificationsRecord() {
    assert(
      'qualifications record is expected to be loaded at this point. Is it missing from the database?',
      this._noQualificationsRecord,
    );

    return this._noQualificationsRecord;
  }

  get showSelect() {
    return this.choiceValue === 'yes';
  }

  @action
  handleChoiceChange(value?: string) {
    this.choiceValue = value;

    if (value === 'no') {
      this.args.onChange([this.noQualificationsRecord]);
    } else {
      this.args.onChange([]);
    }
  }

  async #loadOptions() {
    const { content: qualifications } = await this.store.request(
      query<AdditionalQualificationCode>('additional-qualification-code', {
        // There are currently 21 records in the DB, ensure this number is big enough to load all of them at once
        'page[size]': 21,
        sort: 'label',
      }),
    );

    this._noQualificationsRecord = qualifications.find((qualification) => {
      return qualification.id === ADDITIONAL_QUALIFICATIONS.NONE;
    });

    return qualifications.filter(
      (qualification) => qualification !== this.noQualificationsRecord,
    );
  }

  <template>
    <Await @promise={{this.optionsPromise}}>
      <:pending>
        <AuLoader @inline={{true}} @hideMessage={{true}} @centered={{false}}>
          Bijkomende kwalificaties aan het laden
        </AuLoader>
      </:pending>

      <:success>
        <AuRadioGroup
          @alignment="inline"
          @name="additional-qualifications-choice"
          @selected={{this.choiceValue}}
          @onChange={{this.handleChoiceChange}}
          as |Group|
        >
          <Group.Radio @value="yes">Ja</Group.Radio>
          <Group.Radio @value="no">Nee</Group.Radio>
        </AuRadioGroup>
        {{#if this.showSelect}}
          <div
            class="au-u-margin-top-tiny
              {{if @error 'ember-power-select--error'}}"
          >
            <PowerSelect
              @multiple={{true}}
              @loadingMessage="Aan het laden..."
              @noMatchesMessage="Geen resultaten"
              @searchEnabled={{true}}
              @searchField="label"
              @options={{this.optionsPromise}}
              @selected={{@selected}}
              @onChange={{@onChange}}
              @triggerId={{@id}}
              @closeOnSelect={{false}}
              as |qualification|
            >
              {{#if qualification.definition}}
                <AuTooltip as |tooltip|>
                  <div
                    class="au-u-flex au-u-flex--vertical-center"
                    {{tooltip.target}}
                  >
                    {{qualification.label}}
                    <AuIcon @icon="info-circle" class="au-u-margin-left-tiny" />
                  </div>
                  <tooltip.Content>
                    {{qualification.definition}}
                  </tooltip.Content>
                </AuTooltip>
              {{else}}
                {{qualification.label}}
              {{/if}}
            </PowerSelect>
          </div>
        {{/if}}
      </:success>
    </Await>
  </template>
}
