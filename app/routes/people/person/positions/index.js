import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isActivePosition } from 'frontend-organization-portal/utils/position';

export default class PeoplePersonPositionsIndexRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
  };

  async model(params) {
    let { id: personId } = this.paramsFor('people.person');

    let person = await this.store.findRecord('person', personId, {
      reload: true,
    });

    let positions = [];

    const mandatories = (await person.mandatories).toArray(); // mandatarissen
    const agents = (await person.agents).toArray(); // leidinggevenden
    const ministers = (await person.agentsInPosition).toArray(); // bedinaren

    for (let mandatory of mandatories) {
      const mandate = await mandatory.mandate;
      const status = await mandatory.status;
      const role = await mandate.roleBoard;
      const governingBody = await mandate.governingBody;
      const isTimeSpecializationOf = await governingBody.isTimeSpecializationOf;
      const administrativeUnit =
        await isTimeSpecializationOf.administrativeUnit;
      positions.push({
        role: role.label,
        type: 'mandatory',
        status,
        id: mandatory.id,
        startDate: mandatory.startDate,
        endDate: mandatory.endDate,
        administrativeUnit,
      });
    }

    for (let agent of agents) {
      const status = await agent.status;
      const boardPosition = await agent.boardPosition;
      const role = await boardPosition.roleBoard;
      const governingBodies = await boardPosition.governingBodies;

      let administrativeUnits = [];
      for (const governingBody of governingBodies.toArray()) {
        const isTimeSpecializationOf =
          await governingBody.isTimeSpecializationOf;
        const administrativeUnit =
          await isTimeSpecializationOf.administrativeUnit;
        administrativeUnits.push(administrativeUnit);
      }

      positions.push({
        role: role.label,
        type: 'agent',
        id: agent.id,
        status,
        startDate: agent.startDate,
        endDate: agent.endDate,
        administrativeUnits,
      });
    }

    for (let minister of ministers) {
      const position = await minister.position;
      const role = await position.function;
      const administrativeUnit = await position.worshipService;
      positions.push({
        role: role.label,
        type: 'minister',
        id: minister.id,
        startDate: minister.agentStartDate,
        endDate: minister.agentEndDate,
        administrativeUnit,
      });
    }

    // We have to sort manually instead of directly in the backend request because we are merging
    // ressources from different types in this route

    if (params.sort.length) {
      if (params.sort == 'position.status') {
        positions = positions.sort(function (a, b) {
          return isActivePosition(b.endDate) - isActivePosition(a.endDate);
        });
      } else if (params.sort == '-position.status') {
        positions = positions.sort(function (a, b) {
          return isActivePosition(a.endDate) - isActivePosition(b.endDate);
        });
      } else if (params.sort == 'position.role') {
        positions = positions.sort(function (a, b) {
          return a.role.localeCompare(b.role);
        });
      } else if (params.sort == '-position.role') {
        positions = positions.sort(function (a, b) {
          return b.role.localeCompare(a.role);
        });
      } else if (params.sort == 'position.administrative-unit.name') {
        positions = positions.sort(function (a, b) {
          return a.administrativeUnit.name.localeCompare(
            b.administrativeUnit.name
          );
        });
      } else if (params.sort == '-position.administrative-unit.name') {
        positions = positions.sort(function (a, b) {
          return b.administrativeUnit.name.localeCompare(
            a.administrativeUnit.name
          );
        });
      }
    }

    return {
      person,
      positions,
    };
  }
}
