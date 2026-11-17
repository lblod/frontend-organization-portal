import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import breadcrumbs from 'ember-breadcrumb-trail/helpers/breadcrumbs';
import isLast from '../helpers/is-last';

<template>
  <AuToolbar @border="bottom" @size="small" @skin="tint">
    <nav aria-label="breadcrumbs">
      <ol class="au-c-list-horizontal au-c-list-horizontal--breadcrumbs">
        <li class="au-c-list-horizontal__item">
          <AuLink @route="index" @icon="arrow-left" @iconAlignment="left">
            Overzicht
          </AuLink>
        </li>
        {{#each (breadcrumbs) as |breadcrumb|}}
          <li class="au-c-list-horizontal__item">
            {{#if (isLast breadcrumb (breadcrumbs))}}
              {{breadcrumb.title}}
            {{else}}
              <AuLink
                @route={{breadcrumb.data.route}}
                @model={{breadcrumb.data.model}}
                @models={{breadcrumb.data.models}}
              >
                {{breadcrumb.title}}
              </AuLink>
            {{/if}}
          </li>
        {{/each}}
      </ol>
    </nav>

  </AuToolbar>
</template>
