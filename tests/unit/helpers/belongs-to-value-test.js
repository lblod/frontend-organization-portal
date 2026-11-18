import Model, { belongsTo } from '@warp-drive/legacy/model';
import { module, test } from 'qunit';
import belongsToValue from 'frontend-organization-portal/helpers/belongs-to-value';
import { setupTest } from 'frontend-organization-portal/tests/helpers';

module('Unit | Helper | belongsToValue', function (hooks) {
  setupTest(hooks);

  test('it returns (loaded) async relationship data in a sync way', function (assert) {
    this.owner.register(
      'model:foo',
      class Foo extends Model {
        @belongsTo('bar', {
          async: true,
          inverse: null,
        })
        bar;
      },
    );

    this.owner.register('model:bar', class Bar extends Model {});
    const store = this.owner.lookup('service:store');

    const bar = store.push({
      data: {
        id: '1',
        type: 'bar',
      },
    });
    const foo = store.push({
      data: {
        id: '1',
        type: 'foo',
        relationships: {
          bar: {
            data: {
              id: '1',
              type: 'bar',
            },
          },
        },
      },
    });

    const result = belongsToValue(foo, 'bar');
    assert.strictEqual(result, bar);
  });

  test("it returns null if the relationship hasn't been loaded yet", function (assert) {
    this.owner.register(
      'model:foo',
      class Foo extends Model {
        @belongsTo('bar', {
          async: true,
          inverse: null,
        })
        bar;
      },
    );

    this.owner.register('model:bar', class Bar extends Model {});
    const store = this.owner.lookup('service:store');

    const foo = store.push({
      data: {
        id: '1',
        type: 'foo',
        relationships: {
          bar: {
            data: {
              id: '1',
              type: 'bar',
            },
          },
        },
      },
    });

    const result = belongsToValue(foo, 'bar');
    assert.strictEqual(result, null);
  });

  test('it returns the related record of a newly created record', function (assert) {
    this.owner.register(
      'model:foo',
      class Foo extends Model {
        @belongsTo('bar', {
          async: true,
          inverse: null,
        })
        bar;
      },
    );

    this.owner.register('model:bar', class Bar extends Model {});
    const store = this.owner.lookup('service:store');

    const bar = store.createRecord('bar');
    const foo = store.createRecord('foo', {
      bar,
    });

    const result = belongsToValue(foo, 'bar');
    assert.strictEqual(result, bar);
  });
});
