<div class="au-o-grid au-o-grid--small" ...attributes>
  {{#if @itemComponent}}
    {{yield @itemComponent}}
  {{else}}
    {{yield}}
  {{/if}}
</div>