import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class PositionSelectComponent extends Component {
  @service store;
  @service currentSession;

  get selectedPosition() {
    if (typeof this.args.selected === 'string') {
      return this.findPositionById(this.args.selected);
    }

    return this.args.selected;
  }

  findPositionById(id) {
    if (this.positions.isRunning) {
      return null;
    }

    let position = this.positions.value;
    return position.find((p) => p.id === id);
  }

  loadPositionTask = task(async () => {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    await Promise.resolve();

    let boardPositionCodes = [];
    let ministerPositions = [];

    // Filter out blacklisted data if an organization is selected
    if (
      this.args.selectedOrganization &&
      this.args.selectedOrganization.length
    ) {
      const selectedOrganizationId = this.args.selectedOrganization;

      const organization = (
        await this.store.query('organization', {
          'filter[:id:]': selectedOrganizationId,
          include: 'classification',
        })
      ).at(0);

      const classification = await organization.classification;

      boardPositionCodes = await this.store.query('board-position-code', {
        'filter[applies-to][applies-within][:id:]': classification.id,
      });

      if (classification.id == CLASSIFICATION.WORSHIP_SERVICE.id) {
        ministerPositions = await this.store.query(
          'minister-position-function',
          {
            page: { size: 100 },
          },
        );
      }
    } else {
      let allowedIds = [];
      if (this.currentSession.hasUnitRole) {
        allowedIds = [
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.PROVINCE.id,
          CLASSIFICATION.OCMW.id,
          CLASSIFICATION.DISTRICT.id,
          CLASSIFICATION.AGB.id,
          CLASSIFICATION.APB.id,
          CLASSIFICATION.PROJECTVERENIGING.id,
          CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
          CLASSIFICATION.WELZIJNSVERENIGING.id,
          CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
        ];
      } else {
        allowedIds = [
          CLASSIFICATION.WORSHIP_SERVICE.id,
          CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
        ];
      }

      boardPositionCodes = await this.store.query('board-position-code', {
        'filter[applies-to][applies-within][:id:]': allowedIds.join(),
        page: { size: 100 },
      });

      if (this.currentSession.hasWorshipRole) {
        ministerPositions = await this.store.query(
          'minister-position-function',
          {
            page: { size: 100 },
          },
        );
      }
    }

    let positions;
    if (ministerPositions.length) {
      positions = [
        ...ministerPositions.slice(),
        ...boardPositionCodes.slice(),
      ].sort(function (a, b) {
        return a.label.localeCompare(b.label);
      });
    } else {
      positions = [...boardPositionCodes.slice()].sort(function (a, b) {
        return a.label.localeCompare(b.label);
      });
    }

    return positions;
  });

  positions = trackedTask(this, this.loadPositionTask, () => [
    this.args.selectedOrganization,
  ]);
}
