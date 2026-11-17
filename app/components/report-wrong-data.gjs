import Component from '@glimmer/component';

export default class ReportWrongDataComponent extends Component {
  get subject() {
    return 'Melden van onvolledige of foutieve data';
  }

  get body() {
    const url = encodeURIComponent(window.location.href);
    return `URL met onvolledige of foutieve data: ${url}`;
  }
}

<AuHelpText>
  Zie je een fout in de data?
  <AuLinkExternal
    href="mailto:{{config
      'contactEmail'
    }}?subject={{this.subject}}&body={{this.body}}"
  >Meld het ons!
  </AuLinkExternal>
</AuHelpText>