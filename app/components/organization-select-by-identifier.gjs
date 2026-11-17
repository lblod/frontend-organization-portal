<div class={{if @error "ember-power-select--error"}} ...attributes>
  <PowerSelect
    @allowClear={{true}}
    @searchEnabled={{true}}
    @loadingMessage="Aan het laden..."
    @noMatchesMessage="Geen resultaten"
    @searchMessage="Typ om te zoeken"
    @search={{perform this.loadOrganizationsTask}}
    @selected={{@selected}}
    @onChange={{@onChange}}
    @triggerId={{@id}}
    as |identifier|
  >
    {{identifier}}
  </PowerSelect>
</div>