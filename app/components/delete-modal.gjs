import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';

<template>
  <AuModal @modalOpen={{true}} @closeModal={{@onCancel}}>
    <:title>{{@title}}</:title>
    <:body>{{@message}}</:body>
    <:footer>
      <AuToolbar @reverse={{true}} as |Group|>
        <Group>
          <AuButton
            @skin="secondary"
            {{on "click" @onCancel}}
          >Annuleren</AuButton>
          <AuButton
            @alert={{true}}
            @icon="bin"
            @iconAlignment="left"
            {{on "click" @onConfirm}}
          >{{@deleteLabel}}</AuButton>
        </Group>
      </AuToolbar>
    </:footer>
  </AuModal>{{yield}}
</template>
