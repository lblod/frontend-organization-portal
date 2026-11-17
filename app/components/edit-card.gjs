import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import or from 'ember-truth-helpers/helpers/or';
import { hash } from '@ember/helper';
import CardGrid from './card-grid';
import EditCardItem from './edit-card/item';
import CardColumns from './card-columns';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';

<template>
  <div class="au-u-max-width-large" ...attributes>
    {{#if (has-block "title")}}
      <AuHeading
        @level={{or @headingLevel "3"}}
        @skin={{or @headingSkin "5"}}
        class="au-u-margin-bottom-tiny"
      >
        {{yield to="title"}}
      </AuHeading>
    {{/if}}

    <div class="au-o-box au-o-box--small au-c-card au-c-card--fill">
      <div class="au-c-card__content">
        {{yield
          (hash
            Grid=(component
              CardGrid itemComponent=(component EditCardItem isGrid=true)
            )
            Columns=(component
              CardColumns itemComponent=(component EditCardItem)
            )
          )
          to="card"
        }}

        {{#if @containsRequiredFields}}
          <AuHelpText @skin="secondary" class="au-u-margin-top">
            * Verplicht veld
          </AuHelpText>
        {{/if}}
      </div>
    </div>
  </div>
</template>
