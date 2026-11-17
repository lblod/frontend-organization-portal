import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { ProseParser, Schema, Selection } from '@lblod/ember-rdfa-editor';
import {
  block_rdfa,
  doc,
  hard_break,
  horizontal_rule,
  invisible_rdfa,
  paragraph,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import { inline_rdfa } from '@lblod/ember-rdfa-editor/marks';
import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import {
  tableKeymap,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import { link, linkView } from '@lblod/ember-rdfa-editor/plugins/link';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import {
  bullet_list,
  list_item,
  ordered_list,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import AuContent from '@appuniversum/ember-appuniversum/components/au-content';
import { on } from '@ember/modifier';
import EditorContainer from '@lblod/ember-rdfa-editor/components/editor-container';
import Toolbar from '@lblod/ember-rdfa-editor/components/toolbar';
import HeadingMenu from '@lblod/ember-rdfa-editor/components/plugins/heading/heading-menu';
import Bold from '@lblod/ember-rdfa-editor/components/plugins/text-style/bold';
import Italic from '@lblod/ember-rdfa-editor/components/plugins/text-style/italic';
import ExtraFormattingOptions from './rich-text-editor/extra-formatting-options';
import Unordered from '@lblod/ember-rdfa-editor/components/plugins/list/unordered';
import Ordered from '@lblod/ember-rdfa-editor/components/plugins/list/ordered';
import LinkMenu from '@lblod/ember-rdfa-editor/components/plugins/link/link-menu';
import TableMenu from '@lblod/ember-rdfa-editor/components/plugins/table/table-menu';
import Editor from '@lblod/ember-rdfa-editor/components/editor';

export default class RichTextEditorComponent extends Component {
  @tracked editorController;
  inputId = 'richtext-' + guidFor(this);
  plugins = [tablePlugin, tableKeymap];
  @tracked value;

  constructor() {
    super(...arguments);
    this.value = this.args.value;
  }

  nodeViews = (controller) => {
    return {
      link: linkView(this.linkOptions)(controller),
    };
  };

  get config() {
    if (!this.args.config) {
      return {
        bold: true,
        italic: true,
        list: true,
        link: true,
      };
    }
    return this.args.config;
  }

  schema = new Schema({
    nodes: {
      doc,
      paragraph,

      repaired_block,

      list_item,
      ordered_list,
      bullet_list,
      placeholder,
      ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
      heading,
      blockquote,

      horizontal_rule,
      code_block,

      text,

      image,

      hard_break,
      invisible_rdfa,
      block_rdfa,
      link: link(this.linkOptions),
    },
    marks: {
      inline_rdfa,
      em,
      strong,
      underline,
      strikethrough,
      subscript,
      superscript,
    },
  });

  get linkOptions() {
    return {
      interactive: true,
    };
  }

  @action
  handleRdfaEditorInit(editorController) {
    this.editorController = editorController;
    this.setInitialValue();
  }

  @action
  updateValue(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    //rdfaEditor setup is async, updateValue may be called before it is set
    if (this.editorController) {
      this.hasBeenFocused = true;
      const htmlContent = this.editorController.htmlContent;
      const hasTextContent = Boolean(
        this.editorController.mainEditorState.doc.textContent,
      );
      const editorValue = hasTextContent
        ? postProccessLinks(stripNbspEntities(htmlContent))
        : '';
      // Only trigger an update if the value actually changed.
      // This prevents that the form observer is triggered even though no editor content was changed.
      if (this.value !== editorValue) {
        requestAnimationFrame(() => this.args.onChange(editorValue));
      }
    }
  }

  setInitialValue() {
    if (this.value) {
      // We replicate the behavior of the controller.setHtmlContent method without focussing the field.
      // Since we use the `focusout` event focusing the field would trigger the `updateValue` action,
      // which in turn causes the "unsaved changes" modal to appear when it shouldn't.
      // Source: https://github.com/lblod/ember-rdfa-editor/blob/4dc3fdf14ac3e92567db22811bb76b2079c2280b/addon/core/say-controller.ts#L42-L58
      const { editorController } = this;
      const tr = editorController.mainEditorState.tr;
      const domParser = new DOMParser();
      tr.replaceWith(
        0,
        tr.doc.nodeSize - 2,
        ProseParser.fromSchema(this.schema).parse(
          domParser.parseFromString(this.value, 'text/html'),
          {
            preserveWhitespace: true,
          },
        ),
      );
      tr.setSelection(Selection.atEnd(tr.doc));
      editorController.editor.mainView.dispatch(tr);
    }
  }

  <template>
    {{#if @show}}
      <AuContent @skin="tiny" class="rich-text-editor-content">
        {{! template-lint-disable no-triple-curlies}}
        {{{this.value}}}
      </AuContent>
    {{else}}
      <div class="rich-text-editor" {{on "focusout" this.updateValue}}>
        <EditorContainer @controller={{this.editorController}}>
          <:top>
            <Toolbar as |Tb|>
              {{#if this.config.heading}}
                <Tb.Group>
                  <HeadingMenu @controller={{this.editorController}} />
                </Tb.Group>
              {{/if}}
              <Tb.Group>
                {{#if this.config.bold}}
                  <Bold @controller={{this.editorController}} />
                {{/if}}
                {{#if this.config.italic}}
                  <Italic @controller={{this.editorController}} />
                {{/if}}
                {{#if this.config.extraFormatting}}
                  <ExtraFormattingOptions
                    @controller={{this.editorController}}
                  />
                {{/if}}
              </Tb.Group>
              {{#if this.config.list}}
                <Tb.Group>
                  <Unordered @controller={{this.editorController}} />
                  <Ordered @controller={{this.editorController}} />
                </Tb.Group>
              {{/if}}
              <Tb.Group>
                {{#if this.config.link}}
                  <LinkMenu @controller={{this.editorController}} />
                {{/if}}
                {{#if this.config.table}}
                  <TableMenu @controller={{this.editorController}} />
                {{/if}}
              </Tb.Group>
            </Toolbar>
          </:top>
          <:default>
            <Editor
              @schema={{this.schema}}
              @rdfaEditorInit={{this.handleRdfaEditorInit}}
              @plugins={{this.plugins}}
              @nodeViews={{this.nodeViews}}
            />
          </:default>
        </EditorContainer>
      </div>
    {{/if}}
  </template>
}

// https://discuss.prosemirror.net/t/non-breaking-spaces-being-added-to-pasted-html/3911/4
// Kaleidos ran into the same issue:
// https://github.com/kanselarij-vlaanderen/frontend-kaleidos/blob/6489a2dec8d58f2cc981f0c45267821169061cc7/app/components/news-item/edit-panel.js#L84-L100
function stripNbspEntities(htmlContent) {
  return htmlContent.replaceAll(/&nbsp;/gm, ' ');
}

function postProccessLinks(htmlContent) {
  return htmlContent.replaceAll('<a ', '<a target="_blank" ');
}
