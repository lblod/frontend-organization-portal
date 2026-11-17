import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import or from 'ember-truth-helpers/helpers/or';
import { hash } from '@ember/helper';
import CardGrid from './card-grid';
import DataCardItem from './data-card/item';
import CardColumns from './card-columns';

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
    {{#if (has-block "infotext")}}
      <p class="au-u-margin-bottom-small">
        {{yield to="infotext"}}
      </p>
    {{/if}}

    <dl class="au-o-box au-o-box--small au-c-card au-c-card--data">
      <div class="au-c-card__content">
        {{yield
          (hash
            Grid=(component
              CardGrid itemComponent=(component DataCardItem isGrid=true)
            )
            Columns=(component
              CardColumns itemComponent=(component DataCardItem)
            )
          )
          to="card"
        }}
      </div>
    </dl>
  </div>
</template>
