import {
  selectByRole,
  getClassificationIdsForRole,
} from 'frontend-organization-portal/utils/classification-identifiers';
import { module, test } from 'qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { ORGANIZATION_TYPES } from 'frontend-organization-portal/constants/organization-types';
import { setupTest } from 'ember-qunit';

module('Unit | Utility | classification-identifiers', function (hooks) {
  setupTest(hooks);

  module('selectByRole', function () {
    test('it returns a string of all worship classification code ids for worship role', async function (assert) {
      let result = selectByRole(true);
      // Note: order should be the same as in the CLASSIFICATION object for
      // the test to succeed
      assert.deepEqual(
        result,
        Object.values(CLASSIFICATION)
          .map((cl) => cl.id)
          .filter((id) =>
            [
              CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
              CLASSIFICATION.WORSHIP_SERVICE.id,
              CLASSIFICATION.REPRESENTATIVE_BODY.id,
            ].includes(id)
          )
          .join(', ')
      );
    });

    test('it returns a list for all non-worship classifications code ids when called without argument', async function (assert) {
      const result = selectByRole();
      assert.deepEqual(
        result,
        Object.values(CLASSIFICATION)
          .map((cl) => cl.id)
          .filter(
            (id) =>
              ![
                CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                CLASSIFICATION.WORSHIP_SERVICE.id,
                CLASSIFICATION.REPRESENTATIVE_BODY.id,
              ].includes(id)
          )
          .join(', ')
      );
    });

    test('it returns a list for all non-worship classifications code ids when called with falsy argument', async function (assert) {
      const result = selectByRole(false);
      // Note: order should be the same as in the CLASSIFICATION object for
      // the test to succeed
      assert.deepEqual(
        result,
        Object.values(CLASSIFICATION)
          .map((cl) => cl.id)
          .filter(
            (id) =>
              ![
                CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                CLASSIFICATION.WORSHIP_SERVICE.id,
                CLASSIFICATION.REPRESENTATIVE_BODY.id,
              ].includes(id)
          )
          .join(', ')
      );
    });
  });

  module('getClassificationIdsForRole', function () {
    test('it includes all worship classification code ids for worship role', async function (assert) {
      const result = getClassificationIdsForRole(true);

      assert.deepEqual(
        result.sort(),
        [
          CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
          CLASSIFICATION.WORSHIP_SERVICE.id,
          CLASSIFICATION.REPRESENTATIVE_BODY.id,
        ].sort()
      );
    });

    test('it includes all worship classification code ids for worship role when not restricted to creation', async function (assert) {
      const result = getClassificationIdsForRole(true, false);

      assert.deepEqual(
        [
          CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
          CLASSIFICATION.WORSHIP_SERVICE.id,
          CLASSIFICATION.REPRESENTATIVE_BODY.id,
        ].sort(),
        result.sort()
      );
    });

    test('it does not include representative body classification id when restricted for creation', async function (assert) {
      const result = getClassificationIdsForRole(true, true);

      assert.deepEqual(
        result.sort(),
        [
          CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
          CLASSIFICATION.WORSHIP_SERVICE.id,
        ].sort()
      );

      assert.notOk(result.includes(CLASSIFICATION.REPRESENTATIVE_BODY.id));
    });

    test('it returns a list for all non-worship classifications code ids when called with falsy argument', async function (assert) {
      const result = getClassificationIdsForRole(false);

      assert.deepEqual(
        result.sort(),
        Object.values(CLASSIFICATION)
          .map((cl) => cl.id)
          .filter(
            (id) =>
              ![
                CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                CLASSIFICATION.WORSHIP_SERVICE.id,
                CLASSIFICATION.REPRESENTATIVE_BODY.id,
              ].includes(id)
          )
          .sort()
      );

      assert.notOk(result.includes(CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id));
      assert.notOk(result.includes(CLASSIFICATION.WORSHIP_SERVICE.id));
      assert.notOk(result.includes(CLASSIFICATION.REPRESENTATIVE_BODY.id));
    });

    test('it should exclude organizations that cannot be created', async function (assert) {
      let result = getClassificationIdsForRole(false, true);

      assert.deepEqual(
        result.sort(),
        Object.values(CLASSIFICATION)
          .map((cl) => cl.id)
          .filter(
            (id) =>
              ![
                CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                CLASSIFICATION.WORSHIP_SERVICE.id,
                CLASSIFICATION.MUNICIPALITY.id,
                CLASSIFICATION.PROVINCE.id,
                CLASSIFICATION.OCMW.id,
                CLASSIFICATION.REPRESENTATIVE_BODY.id,
              ].includes(id)
          )
          .sort()
      );

      assert.notOk(result.includes(CLASSIFICATION.MUNICIPALITY.id));
      assert.notOk(result.includes(CLASSIFICATION.PROVINCE.id));
      assert.notOk(result.includes(CLASSIFICATION.OCMW.id));
    });

    test('it returns a list for all non-worship classifications code ids when called without argument', async function (assert) {
      let result = getClassificationIdsForRole();

      assert.deepEqual(
        result.sort(),
        Object.values(CLASSIFICATION)
          .map((cl) => cl.id)
          .filter(
            (id) =>
              ![
                CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                CLASSIFICATION.WORSHIP_SERVICE.id,
                CLASSIFICATION.REPRESENTATIVE_BODY.id,
              ].includes(id)
          )
          .sort()
      );

      assert.notOk(result.includes(CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id));
      assert.notOk(result.includes(CLASSIFICATION.WORSHIP_SERVICE.id));
      assert.notOk(result.includes(CLASSIFICATION.REPRESENTATIVE_BODY.id));
    });

    module('organization types filter', function () {
      module('non-worship module', function () {
        test('it should all return non-worship administrative unit classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            false,
            false,
            ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT
          );

          assert.deepEqual(
            result.sort(),
            Object.values(CLASSIFICATION)
              .map((cl) => cl.id)
              .filter(
                (id) =>
                  ![
                    // Worship
                    CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                    CLASSIFICATION.WORSHIP_SERVICE.id,
                    CLASSIFICATION.REPRESENTATIVE_BODY.id,
                    // Non administrative units
                    CLASSIFICATION.ZIEKENHUISVERENIGING.id,
                    CLASSIFICATION
                      .VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
                      .id,
                    CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP
                      .id,
                    CLASSIFICATION.ASSOCIATION_OTHER.id,
                    CLASSIFICATION.CORPORATION_OTHER.id,
                  ].includes(id)
              )
              .sort()
          );
        });

        test('it should return all non-worship association classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            false,
            false,
            ORGANIZATION_TYPES.ASSOCIATION
          );

          assert.deepEqual(
            result.sort(),
            [
              CLASSIFICATION.ZIEKENHUISVERENIGING.id,
              CLASSIFICATION
                .VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id,
              CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
              CLASSIFICATION.ASSOCIATION_OTHER.id,
            ].sort()
          );
        });

        test('it should return all non-worship corporation classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            false,
            false,
            ORGANIZATION_TYPES.CORPORATION
          );

          assert.deepEqual(result.sort(), [
            CLASSIFICATION.CORPORATION_OTHER.id,
          ]);
        });

        test('it should return all non-worship administrative unit and association classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            false,
            false,
            ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
            ORGANIZATION_TYPES.ASSOCIATION
          );

          assert.deepEqual(
            result.sort(),
            Object.values(CLASSIFICATION)
              .map((cl) => cl.id)
              .filter(
                (id) =>
                  ![
                    // Worship
                    CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                    CLASSIFICATION.WORSHIP_SERVICE.id,
                    CLASSIFICATION.REPRESENTATIVE_BODY.id,
                    // Non administrative units
                    CLASSIFICATION.CORPORATION_OTHER.id,
                  ].includes(id)
              )
              .sort()
          );
        });

        test('it should return all non-worship administrative unit and corporation classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            false,
            false,
            ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
            ORGANIZATION_TYPES.CORPORATION
          );

          assert.deepEqual(
            result.sort(),
            Object.values(CLASSIFICATION)
              .map((cl) => cl.id)
              .filter(
                (id) =>
                  ![
                    // Worship
                    CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                    CLASSIFICATION.WORSHIP_SERVICE.id,
                    CLASSIFICATION.REPRESENTATIVE_BODY.id,
                    // Non administrative units
                    CLASSIFICATION.ZIEKENHUISVERENIGING.id,
                    CLASSIFICATION
                      .VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
                      .id,
                    CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP
                      .id,
                    CLASSIFICATION.ASSOCIATION_OTHER.id,
                  ].includes(id)
              )
              .sort()
          );
        });

        test('it should return all non-worship association, and corporation classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            false,
            false,
            ORGANIZATION_TYPES.ASSOCIATION,
            ORGANIZATION_TYPES.CORPORATION
          );

          assert.deepEqual(
            result.sort(),
            Object.values(CLASSIFICATION)
              .map((cl) => cl.id)
              .filter((id) =>
                [
                  // Non administrative units
                  CLASSIFICATION.ZIEKENHUISVERENIGING.id,
                  CLASSIFICATION
                    .VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id,
                  CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
                  CLASSIFICATION.ASSOCIATION_OTHER.id,
                  CLASSIFICATION.CORPORATION_OTHER.id,
                ].includes(id)
              )
              .sort()
          );
        });

        test('it should return all non-worship administrative unit, association, and corporation classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            false,
            false,
            ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
            ORGANIZATION_TYPES.ASSOCIATION,
            ORGANIZATION_TYPES.CORPORATION
          );

          assert.deepEqual(
            result.sort(),
            Object.values(CLASSIFICATION)
              .map((cl) => cl.id)
              .filter(
                (id) =>
                  ![
                    // Worship
                    CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                    CLASSIFICATION.WORSHIP_SERVICE.id,
                    CLASSIFICATION.REPRESENTATIVE_BODY.id,
                  ].includes(id)
              )
              .sort()
          );
        });

        module('creatable organisations', function () {
          test('it should return all creatable, non-worship administrative unit classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              false,
              true,
              ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT
            );

            assert.deepEqual(
              result.sort(),
              Object.values(CLASSIFICATION)
                .map((cl) => cl.id)
                .filter(
                  (id) =>
                    ![
                      // Worship
                      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                      CLASSIFICATION.WORSHIP_SERVICE.id,
                      CLASSIFICATION.REPRESENTATIVE_BODY.id,
                      // Non administrative units
                      CLASSIFICATION.ZIEKENHUISVERENIGING.id,
                      CLASSIFICATION
                        .VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
                        .id,
                      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP
                        .id,
                      CLASSIFICATION.ASSOCIATION_OTHER.id,
                      CLASSIFICATION.CORPORATION_OTHER.id,
                      // Uncreatable administrative units
                      CLASSIFICATION.MUNICIPALITY.id,
                      CLASSIFICATION.PROVINCE.id,
                      CLASSIFICATION.OCMW.id,
                    ].includes(id)
                )
                .sort()
            );
          });

          test('it should return all creatable, non-worship association classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              false,
              true,
              ORGANIZATION_TYPES.ASSOCIATION
            );

            assert.deepEqual(
              result.sort(),
              [
                CLASSIFICATION.ZIEKENHUISVERENIGING.id,
                CLASSIFICATION
                  .VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id,
                CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
                CLASSIFICATION.ASSOCIATION_OTHER.id,
              ].sort()
            );
          });

          test('it should return all creatable, non-worship corporation classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              false,
              true,
              ORGANIZATION_TYPES.CORPORATION
            );

            assert.deepEqual(result.sort(), [
              CLASSIFICATION.CORPORATION_OTHER.id,
            ]);
          });

          test('it should return all creatable, non-worship administrative unit and association classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              false,
              true,
              ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
              ORGANIZATION_TYPES.ASSOCIATION
            );

            assert.deepEqual(
              result.sort(),
              Object.values(CLASSIFICATION)
                .map((cl) => cl.id)
                .filter(
                  (id) =>
                    ![
                      // Worship
                      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                      CLASSIFICATION.WORSHIP_SERVICE.id,
                      CLASSIFICATION.REPRESENTATIVE_BODY.id,
                      // Non administrative units
                      CLASSIFICATION.CORPORATION_OTHER.id,
                      // Uncreatable administrative units
                      CLASSIFICATION.MUNICIPALITY.id,
                      CLASSIFICATION.PROVINCE.id,
                      CLASSIFICATION.OCMW.id,
                    ].includes(id)
                )
                .sort()
            );
          });

          test('it should return all creatable, non-worship administrative unit and corporation classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              false,
              true,
              ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
              ORGANIZATION_TYPES.CORPORATION
            );

            assert.deepEqual(
              result.sort(),
              Object.values(CLASSIFICATION)
                .map((cl) => cl.id)
                .filter(
                  (id) =>
                    ![
                      // Worship
                      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                      CLASSIFICATION.WORSHIP_SERVICE.id,
                      CLASSIFICATION.REPRESENTATIVE_BODY.id,
                      // Non administrative units
                      CLASSIFICATION.ZIEKENHUISVERENIGING.id,
                      CLASSIFICATION
                        .VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
                        .id,
                      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP
                        .id,
                      CLASSIFICATION.ASSOCIATION_OTHER.id,
                      // Uncreatable administrative units
                      CLASSIFICATION.MUNICIPALITY.id,
                      CLASSIFICATION.PROVINCE.id,
                      CLASSIFICATION.OCMW.id,
                    ].includes(id)
                )
                .sort()
            );
          });

          test('it should return all non-worship association, and corporation classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              false,
              true,
              ORGANIZATION_TYPES.ASSOCIATION,
              ORGANIZATION_TYPES.CORPORATION
            );

            assert.deepEqual(
              result.sort(),
              Object.values(CLASSIFICATION)
                .map((cl) => cl.id)
                .filter((id) =>
                  [
                    // Non administrative units
                    CLASSIFICATION.ZIEKENHUISVERENIGING.id,
                    CLASSIFICATION
                      .VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
                      .id,
                    CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP
                      .id,
                    CLASSIFICATION.ASSOCIATION_OTHER.id,
                    CLASSIFICATION.CORPORATION_OTHER.id,
                  ].includes(id)
                )
                .sort()
            );
          });

          test('it should return all creatable, non-worship administrative unit, association, and corporation classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              false,
              true,
              ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
              ORGANIZATION_TYPES.ASSOCIATION,
              ORGANIZATION_TYPES.CORPORATION
            );

            assert.deepEqual(
              result.sort(),
              Object.values(CLASSIFICATION)
                .map((cl) => cl.id)
                .filter(
                  (id) =>
                    ![
                      // Worship
                      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                      CLASSIFICATION.WORSHIP_SERVICE.id,
                      CLASSIFICATION.REPRESENTATIVE_BODY.id,
                      // Uncreatable administrative units
                      CLASSIFICATION.MUNICIPALITY.id,
                      CLASSIFICATION.PROVINCE.id,
                      CLASSIFICATION.OCMW.id,
                    ].includes(id)
                )
                .sort()
            );
          });
        });
      });

      module('worship module', function () {
        test('it should return all worship administrative unit classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            true,
            false,
            ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT
          );

          assert.deepEqual(
            result.sort(),
            [
              CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
              CLASSIFICATION.WORSHIP_SERVICE.id,
              CLASSIFICATION.REPRESENTATIVE_BODY.id,
            ].sort()
          );
        });

        test('it should return all worship association classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            true,
            false,
            ORGANIZATION_TYPES.ASSOCIATION
          );

          assert.deepEqual(result.sort(), [].sort());
        });

        test('it should return all worship corporation classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            true,
            false,
            ORGANIZATION_TYPES.CORPORATION
          );

          assert.deepEqual(result.sort(), []);
        });

        test('it should return all worship administrative unit and association classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            true,
            false,
            ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
            ORGANIZATION_TYPES.ASSOCIATION
          );

          assert.deepEqual(
            result.sort(),
            [
              CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
              CLASSIFICATION.WORSHIP_SERVICE.id,
              CLASSIFICATION.REPRESENTATIVE_BODY.id,
            ].sort()
          );
        });

        test('it should return all worship administrative unit and corporation classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            true,
            false,
            ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
            ORGANIZATION_TYPES.CORPORATION
          );

          assert.deepEqual(
            result.sort(),
            [
              CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
              CLASSIFICATION.WORSHIP_SERVICE.id,
              CLASSIFICATION.REPRESENTATIVE_BODY.id,
            ].sort()
          );
        });

        test('it should return all worship administrative unit, association, and corporation classification code identifiers', async function (assert) {
          let result = getClassificationIdsForRole(
            true,
            false,
            ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
            ORGANIZATION_TYPES.ASSOCIATION,
            ORGANIZATION_TYPES.CORPORATION
          );

          assert.deepEqual(
            result.sort(),
            [
              CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
              CLASSIFICATION.WORSHIP_SERVICE.id,
              CLASSIFICATION.REPRESENTATIVE_BODY.id,
            ].sort()
          );
        });

        module('creatable worship organizations', function () {
          test('it should return all creatable worship administrative unit classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              true,
              true,
              ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT
            );

            assert.deepEqual(
              result.sort(),
              [
                CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                CLASSIFICATION.WORSHIP_SERVICE.id,
              ].sort()
            );
          });

          test('it should return all creatable worship association classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              true,
              true,
              ORGANIZATION_TYPES.ASSOCIATION
            );

            assert.deepEqual(result.sort(), [].sort());
          });

          test('it should return all creatable worship corporation classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              true,
              true,
              ORGANIZATION_TYPES.CORPORATION
            );

            assert.deepEqual(result.sort(), []);
          });

          test('it should return all creatable worship administrative unit and association classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              true,
              true,
              ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
              ORGANIZATION_TYPES.ASSOCIATION
            );

            assert.deepEqual(
              result.sort(),
              [
                CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                CLASSIFICATION.WORSHIP_SERVICE.id,
              ].sort()
            );
          });

          test('it should return all creatable worship administrative unit and corporation classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              true,
              true,
              ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
              ORGANIZATION_TYPES.CORPORATION
            );

            assert.deepEqual(
              result.sort(),
              [
                CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                CLASSIFICATION.WORSHIP_SERVICE.id,
              ].sort()
            );
          });

          test('it should return all creatable worship administrative unit, association, and corporation classification code identifiers', async function (assert) {
            let result = getClassificationIdsForRole(
              true,
              true,
              ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
              ORGANIZATION_TYPES.ASSOCIATION,
              ORGANIZATION_TYPES.CORPORATION
            );

            assert.deepEqual(
              result.sort(),
              [
                CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                CLASSIFICATION.WORSHIP_SERVICE.id,
              ].sort()
            );
          });
        });
      });

      test('it should ignore unknown organization types', async function (assert) {
        let result = getClassificationIdsForRole(
          false,
          false,
          ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
          'Not an organization type',
          null,
          ORGANIZATION_TYPES.ASSOCIATION,
          true,
          undefined,
          ORGANIZATION_TYPES.CORPORATION,
          123
        );

        assert.deepEqual(
          result.sort(),
          Object.values(CLASSIFICATION)
            .map((cl) => cl.id)
            .filter(
              (id) =>
                ![
                  // Worship
                  CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
                  CLASSIFICATION.WORSHIP_SERVICE.id,
                  CLASSIFICATION.REPRESENTATIVE_BODY.id,
                ].includes(id)
            )
            .sort()
        );
      });

      test('it should ignore undefined and null when provided as classification code', async function (assert) {
        let result = getClassificationIdsForRole(true, true, undefined, null);

        assert.deepEqual(
          result.sort(),
          [
            CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
            CLASSIFICATION.WORSHIP_SERVICE.id,
          ].sort()
        );
      });
    });
  });
});
