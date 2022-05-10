/* eslint-disable no-undef */
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember.built-in-components.import' }, // Ember inspector triggers this
    { handler: 'silence', matchId: 'ember-global' }, // Ember-acmidm-login triggers this
    { handler: 'silence', matchId: 'ember-modifier.use-destroyables' }, // PowerSelect triggers it
    { handler: 'silence', matchId: 'ember-modifier.use-modify' }, // PowerSelect triggers it
    {
      handler: 'silence',
      matchId: 'deprecated-run-loop-and-computed-dot-access',
    }, // Ember-acmidm-login triggers this
    { handler: 'silence', matchId: 'ember-modifier.no-args-property' }, // PowerSelect triggers it
    { handler: 'silence', matchId: 'ember-modifier.no-element-property' }, // PowerSelect triggers it
  ],
};
