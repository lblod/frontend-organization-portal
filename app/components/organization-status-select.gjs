<div class={{if @error "ember-power-select--error"}}>
  <PowerSelect
    @allowClear={{@allowClear}}
    @searchEnabled={{true}}
    @searchField="label"
    @loadingMessage="Aan het laden..."
    @options={{this.loadOrganizationStatusesTask.last}}
    @selected={{this.selectedOrganizationStatus}}
    @onChange={{@onChange}}
    @triggerId={{@id}}
    as |organizationStatus|
  >
    {{organizationStatus.label}}
  </PowerSelect>
</div>