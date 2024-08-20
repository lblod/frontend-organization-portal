import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import Model, { hasMany } from '@ember-data/model';
import hasManyValue from 'frontend-organization-portal/helpers/has-many-value';

module('Unit | Helper | hasManyValue', function (hooks) {
  setupTest(hooks);

  test('it returns (loaded) async relationship data in a sync way', async function (assert) {
    this.owner.register(
      'model:foo',
      class Foo extends Model {
        @hasMany('bar', {
          async: true,
          inverse: null,
        })
        bars;
      },
    );

    this.owner.register('model:bar', class Bar extends Model {});
    const store = this.owner.lookup('service:store');

    this.foo = store.createRecord('foo', {
      bars: [store.createRecord('bar'), store.createRecord('bar')],
    });

    const result = hasManyValue(this.foo, 'bars');
    assert.strictEqual(result.length, 2);
  });

  test("it returns null if the relationship hasn't been loaded yet", async function (assert) {
    this.owner.register(
      'model:foo',
      class Foo extends Model {
        @hasMany('bar', {
          async: true,
          inverse: null,
        })
        bars;
      },
    );

    this.owner.register('model:bar', class Bar extends Model {});
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '1',
        type: 'foo',
        relationships: {
          bars: {
            data: [
              {
                id: '1',
                type: 'bar',
              },
              {
                id: '2',
                type: 'bar',
              },
              {
                id: '3',
                type: 'bar',
              },
            ],
          },
        },
      },
    });

    const foo = store.peekRecord('foo', '1');
    const result = hasManyValue(foo, 'bars');
    assert.strictEqual(result, null);
  });

  test('it returns sideloaded relationship records', async function (assert) {
    this.owner.register(
      'model:foo',
      class Foo extends Model {
        @hasMany('bar', {
          async: true,
          inverse: null,
        })
        bars;
      },
    );

    this.owner.register('model:bar', class Bar extends Model {});
    const store = this.owner.lookup('service:store');
    store.push({
      data: [
        {
          id: '1',
          type: 'foo',
          relationships: {
            bars: {
              data: [
                {
                  id: '1',
                  type: 'bar',
                },
                {
                  id: '2',
                  type: 'bar',
                },
                {
                  id: '3',
                  type: 'bar',
                },
              ],
            },
          },
        },
        {
          id: '1',
          type: 'bar',
        },
        {
          id: '2',
          type: 'bar',
        },
        {
          id: '3',
          type: 'bar',
        },
      ],
    });

    const foo = store.peekRecord('foo', '1');
    const result = hasManyValue(foo, 'bars');
    assert.strictEqual(result.length, 3);
  });
});
