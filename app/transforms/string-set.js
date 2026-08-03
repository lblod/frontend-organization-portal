// Inlined from https://github.com/mu-semtech/ember-mu-transform-helpers
import { typeOf } from '@ember/utils';
import { assert } from '@ember/debug';
import { Transform } from '@warp-drive/legacy/serializer/transform';

export default class StringSetTransform extends Transform {
  deserialize(serialized) {
    assert(
      `Expected array but got ${typeOf(serialized)}`,
      !serialized || typeOf(serialized) === 'array',
    );
    return serialized || [];
  }

  serialize(deserialized) {
    assert(
      `Expected array but got ${typeOf(deserialized)}`,
      !deserialized || typeOf(deserialized) === 'array',
    );
    return deserialized || [];
  }
}
