<AuInput
  @disabled={{@disabled}}
  @error={{@error}}
  @warning={{@warning}}
  @width={{@width}}
  type="tel"
  value={{@value}}
  {{on "focusout" @onUpdate}}
  {{this.phoneInputMask}}
  ...attributes
/>