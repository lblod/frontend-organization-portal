// AuDataTable expects arrays to have a meta.count property for the pagination to work correctly.
// This meta object is automatically set by the serializer, but only for data that passes through Ember Data.
// This util can be used to add the proper count to arrays that are created client side.
// Issue created here https://github.com/appuniversum/ember-appuniversum/issues/136
export function addPaginationMeta(recordArray) {
  recordArray.meta = {
    get count() {
      return recordArray.length;
    },
  };
}
