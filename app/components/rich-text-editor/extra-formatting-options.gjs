import Component from '@glimmer/component';
import Dropdown from '@lblod/ember-rdfa-editor/components/toolbar/dropdown';
import Mark from './mark';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';

export default class ExtraFormattingOptionsComponent extends Component {
  menuItems = [
    { mark: 'underline', label: 'Onderstreept', icon: 'underlined' },
    { mark: 'strikethrough', label: 'Doorstreept', icon: 'strikethrough' },
    { mark: 'subscript', label: 'Subscript', icon: 'subscript' },
    { mark: 'superscript', label: 'Superscript', icon: 'superscript' },
  ];

  get isAnyMenuItemActive() {
    return this.menuItems.some(({ mark: name }) => {
      const { controller } = this.args;
      const mark = controller.schema.marks[name];
      return controller.isMarkActive(mark);
    });
  }

  <template>
    {{#if @controller}}
      <Dropdown
        @label="Meer opmaakopties"
        @hideLabel={{true}}
        @icon="three-dots"
        @iconSize="small"
        @controller={{@controller}}
        class={{if this.isAnyMenuItemActive "say-dropdown--active-items"}}
        as |Menu|
      >
        {{#each this.menuItems as |item|}}
          <Mark @mark={{item.mark}} @controller={{@controller}} as |mark|>
            <Menu.Item
              @menuAction={{mark.toggle}}
              class="extra-formatting-option
                {{if mark.isActive 'extra-formatting-option--active'}}"
            >
              <AuIcon
                @icon={{item.icon}}
                @alignment="left"
                @ariaHidden={{true}}
              />
              {{item.label}}
            </Menu.Item>
          </Mark>
        {{/each}}
      </Dropdown>
    {{/if}}
  </template>
}
