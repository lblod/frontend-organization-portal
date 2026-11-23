// ember-power-select helpers for use in integration tests.
//
// The test-support of ember-power-select only provides helpers to interact
// with the select (open it, type in its search field, choose an option).
// Reading back the selection has to be done through the DOM.
//
// In a multiple select, each selected option is rendered as
//
//   <li class="ember-power-select-multiple-option">
//     <span class="ember-power-select-multiple-remove-btn">×</span>
//     ...the label, as bare text nodes of the yielded block...
//   </li>
//
// so the remove button's text has to be excluded to get the plain label.

export function selectedMultipleOptionLabels(): string[] {
  return [
    ...document.querySelectorAll<HTMLLIElement>(
      '.ember-power-select-multiple-option',
    ),
  ].map((option) => {
    const optionLabel = option.cloneNode(true) as HTMLLIElement;
    optionLabel
      .querySelector<HTMLElement>('.ember-power-select-multiple-remove-btn')
      ?.remove();
    return optionLabel.textContent?.trim() ?? '';
  });
}
