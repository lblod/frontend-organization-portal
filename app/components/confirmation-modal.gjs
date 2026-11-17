import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';

<template>
  <AuModal @modalOpen={{true}} @closeModal={{@onCancel}}>
    <:title>Bevestig</:title>
    <:body>{{@message}}</:body>
    <:footer>
      <AuToolbar @reverse={{true}} as |Group|>
        <Group>
          <AuButton
            @skin="secondary"
            @icon="bin"
            @iconAlignment="left"
            {{on "click" @onCancel}}
          >Nee</AuButton>
          <AuButton {{on "click" @onConfirm}}>Ja</AuButton>
        </Group>
      </AuToolbar>
    </:footer>
  </AuModal>{{yield}}
</template>
