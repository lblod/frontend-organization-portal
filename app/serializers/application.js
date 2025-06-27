import JSONAPISerializer from '@ember-data/serializer/json-api';
// eslint-disable-next-line ember/no-mixins
import DataTableSerializerMixin from 'ember-data-table/mixins/serializer';

export default class ApplicationSerializer extends JSONAPISerializer.extend(
  DataTableSerializerMixin,
) {
  serializeAttribute(snapshot, json, key, attributes) {
    if (key !== 'uri')
      super.serializeAttribute(snapshot, json, key, attributes);
  }
}
