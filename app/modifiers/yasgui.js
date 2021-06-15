import { modifier } from 'ember-modifier';
import Yasgui from '@triply/yasgui';
import env from '../config/environment';

const defaultQuery =
  env.yasgui.defaultQuery !== 'EMBER_YASGUI_DEFAULT_QUERY'
    ? env.yasgui.defaultQuery
    : `
        SELECT * WHERE {
            ?s ?p ?o .
        } LIMIT 10
    `;

export default modifier(function yasgui(element /*, params, hash*/) {
  const yasgui = new Yasgui(element, {
    requestConfig: { endpoint: '/sparql' },
    autofocus: true,
  });
  yasgui.config.yasqe.value = defaultQuery;
  if (env.yasgui.extraPrefixes !== 'EMBER_YASGUI_EXTRA_PREFIXES')
    yasgui.config.yasqe.addPrefixes(JSON.parse(env.yasgui.extraPrefixes));
  else {
    yasgui.config.yasqe.addPrefixes({
      org: 'http://www.w3.org/ns/org#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      mandaat: 'http://data.vlaanderen.be/ns/mandaat#',
      besluit: 'http://data.vlaanderen.be/ns/besluit#',
      generiek: 'https://data.vlaanderen.be/ns/generiek#',
      dc_terms: 'http://purl.org/dc/terms/',
      schema: 'http://schema.org/',
      regorg: 'http://www.w3.org/ns/regorg#',
      person: 'http://www.w3.org/ns/person#',
      vcard: 'http://www.w3.org/2006/vcard/ns#',
      dbpedia: 'https://dbpedia.org/ontology/',
      locn: 'http://www.w3.org/ns/locn#',
    });
  }
});
