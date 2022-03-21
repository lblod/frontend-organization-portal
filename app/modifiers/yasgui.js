import { modifier } from 'ember-modifier';
import config from 'frontend-organization-portal/config/environment';

const defaultQuery =
  config.yasgui.defaultQuery !== '{{YASGUI_DEFAULT_QUERY}}'
    ? config.yasgui.defaultQuery
    : `
        SELECT * WHERE {
            ?s ?p ?o .
        } LIMIT 10
    `;

export default modifier(function yasgui(element /*, params, hash*/) {
  Promise.all([
    import('@triply/yasgui'),
    import('@triply/yasgui/build/yasgui.min.css'),
  ]).then(([module]) => {
    const Yasgui = module.default;
    const yasgui = new Yasgui(element, {
      requestConfig: { endpoint: '/sparql' },
      autofocus: true,
    });
    yasgui.config.yasqe.value = defaultQuery;
    if (config.yasgui.extraPrefixes !== '{{YASGUI_EXTRA_PREFIXES}}')
      yasgui.config.yasqe.addPrefixes(JSON.parse(config.yasgui.extraPrefixes));
  });
});
