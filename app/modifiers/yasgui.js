import { modifier } from 'ember-modifier';
import env from '../config/environment';
import '@triply/yasgui/build/yasgui.min.css';

const defaultQuery =
  env.yasgui.defaultQuery !== '{{YASGUI_DEFAULT_QUERY}}'
    ? env.yasgui.defaultQuery
    : `
        SELECT * WHERE {
            ?s ?p ?o .
        } LIMIT 10
    `;
export default modifier(function yasgui(element /*, params, hash*/) {
  import('@triply/yasgui').then((module) => {
    const Yasgui = module.default;
    const yasgui = new Yasgui(element, {
      requestConfig: { endpoint: '/sparql' },
      autofocus: true,
    });
    yasgui.config.yasqe.value = defaultQuery;
    if (env.yasgui.extraPrefixes !== '{{YASGUI_EXTRA_PREFIXES}}')
      yasgui.config.yasqe.addPrefixes(JSON.parse(env.yasgui.extraPrefixes));
  });
});
