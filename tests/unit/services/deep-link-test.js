import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import RedirectHandler from 'frontend-organization-portal/redirect-handlers/redirect-handler';
import Service from '@ember/service';

module('Unit | Service | deep-link', function (hooks) {
  setupTest(hooks);

  test('it uses the correct RedirectHandler based on the type of a resource', async function (assert) {
    assert.expect(2);

    let deepLink = this.owner.lookup('service:deep-link');
    deepLink.REDIRECT_HANDLER = {
      'http://data.test/vocabularies/test': 'test',
    };

    this.owner.register(
      'redirect-handler:test',
      class extends RedirectHandler {
        redirect(uuid, resourceUri) {
          assert.equal(uuid, '12345');
          assert.equal(resourceUri, 'http://data.test/12345');
        }
      }
    );

    this.owner.register(
      'service:uri-info',
      class MockUriInfoService extends Service {
        async getDirectLinks() {
          return {
            triples: [
              {
                predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                object: { value: 'http://data.test/vocabularies/test' },
              },
              {
                predicate: 'http://mu.semte.ch/vocabularies/core/uuid',
                object: { value: '12345' },
              },
            ],
          };
        }
      }
    );

    await deepLink.redirect('http://data.test/12345');
  });
});
