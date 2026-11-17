<div class={{if @error "ember-power-select--error"}}>
  <PowerSelect
    @disabled={{@disabled}}
    @loadingMessage="Aan het laden..."
    @searchField="label"
    @options={{@options}}
    @selected={{@selected}}
    @onChange={{@onChange}}
    @triggerId={{@id}}
    @allowClear={{@allowClear}}
    as |role|
  >
    {{role}}
  </PowerSelect>
</div>