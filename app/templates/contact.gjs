import pageTitle from 'ember-page-title/helpers/page-title';
import StaticPage from 'frontend-organization-portal/components/static-page';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';

<template>
  {{pageTitle "Contact"}}

  <StaticPage>
    <div class="au-o-region-large au-o-layout">
      <AuHeading class="au-u-margin-bottom">Contact</AuHeading>
      <p class="au-u-margin-bottom">
        Heb je meer informatie nodig bij de werking van het OrganisatiePortaal?
      </p>

      <AuList
        @direction="vertical"
        class="au-c-list--styled au-c-list--styled__disc"
        as |Item|
      >
        {{#each @controller.subjectOptions as |subject|}}
          <Item>
            <AuLinkExternal href={{subject.link}} title={{subject.title}}>
              {{subject.title}}
            </AuLinkExternal>
          </Item>
        {{/each}}
      </AuList>

      <p class="au-u-margin-top au-u-margin-bottom">Indien geen van bovenstaande
        informatiebronnen je kan helpen, klik op één van onderstaande meldingen
        om onze helpdesk te contacteren:</p>

      <AuList
        @direction="vertical"
        class="au-c-list--styled au-c-list--styled__disc"
        as |Item|
      >
        {{#each @controller.issueOptions as |issue|}}
          <Item>
            <AuLinkExternal href={{issue.link}} title={{issue.title}}>
              {{issue.title}}
            </AuLinkExternal>
          </Item>
        {{/each}}
        <Item class="au-c-list__item">Merk je een fout op in data gebruik dan de
          meldingslink “Zie je een fout in de data? Meld het ons!” rechtsboven
          de pagina's met gegeven in het OP.</Item>
      </AuList>

      <p class="au-u-margin-top">Na het verzenden van het formulier wordt je
        melding of vraag omgezet in een ticket en wordt dit behandeld door onze
        helpdeskmedewerker(s). Gelieve geen vragen rechtstreeks naar het
        persoonlijk e-mailadres van de helpdeskmedewer(s) te sturen.</p>

      <p class="au-u-margin-top">Tips om onze helpdeskmedewerker(s) te helpen,
        vind je in onze handleiding onder de sectie
        <a
          target="_blank"
          class="au-c-link"
          rel="nofollow noopener noreferrer"
          href="https://abb-vlaanderen.gitbook.io/handleiding-organisatieportaal/ondersteuning/helpdesk"
        >helpdesk.</a></p>

    </div>
  </StaticPage>
</template>
