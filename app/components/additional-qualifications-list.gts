import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import AuTooltip from '@appuniversum/ember-appuniversum/components/au-tooltip';
import type { TOC } from '@ember/component/template-only';
import type AdditionalQualificationCode from 'frontend-organization-portal/models/additional-qualification-code';

interface Signature {
  Args: {
    qualifications: AdditionalQualificationCode[];
  };
}

/**
 * Displays a read-only list of additional qualification codes as labels,
 * with their definition shown as a tooltip when available.
 */
<template>
  <AuList as |Item|>
    {{#each @qualifications as |qualification|}}
      <Item>
        {{#if qualification.definition}}
          <AuTooltip as |tooltip|>
            <div
              class="au-u-flex au-u-flex--inline au-u-flex--vertical-center"
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
      </Item>
    {{/each}}
  </AuList>
</template> satisfies TOC<Signature>;
