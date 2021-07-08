/* eslint-disable no-undef */
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    // ember-modifiers v1 triggers this, which is bundled by ember-appuniversum
    { handler: 'silence', matchId: 'manager-capabilities.modifiers-3-13' },
    { handler: 'silence', matchId: 'this-property-fallback' }, // AuDataTable triggers this
    { handler: 'silence', matchId: 'implicit-injections' }, // FastBoot triggers this
  ],
};
