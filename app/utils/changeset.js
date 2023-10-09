import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';

export function createValidatedChangeset(obj, validations) {
  return new Changeset(obj, lookupValidator(validations), validations, {
    skipValidate: true,
  });
}

export function destroyOrRollbackChangeset(changeset) {
  if (changeset.isNew) {
    changeset.data.destroyRecord();
  } else {
    changeset.data.rollbackAttributes();
  }

  return changeset;
}
