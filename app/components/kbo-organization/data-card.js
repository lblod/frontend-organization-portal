import Component from '@glimmer/component';

export default class DataCardComponent extends Component {
  noKboMessage =
    'Het KBO nummer is niet ingevuld. Hierdoor kunnen we de KBO gegevens niet tonen.';
  noKboOrganizationMessage =
    'De KBO gegevens van deze organisatie kunnen we niet tonen omdat deze momenteel niet beschikbaar zijn in onze bron Organisatieregister Wegwijs.';
}
