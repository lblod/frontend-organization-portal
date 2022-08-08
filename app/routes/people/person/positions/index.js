import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonPositionsIndexRoute extends Route {
  @service store;

  async model() {
    let { id: personId } = this.paramsFor('people.person');

    let person = await this.store.findRecord('person', personId, {
      reload: true,
    });

    const positions = [];

    const mandatories = (await person.mandatories).toArray(); // mandatarissen
    const agents = (await person.agents).toArray(); // leidinggevenden
    const ministers = (await person.agentsInPosition).toArray(); // bedinaren

    for (let mandatory of mandatories) {
      const mandate = await mandatory.mandate;
      const role = await mandate.roleBoard;
      const governingBody = await mandate.governingBody;
      const isTimeSpecializationOf = await governingBody.isTimeSpecializationOf;
      const administrativeUnit =
        await isTimeSpecializationOf.administrativeUnit;
      positions.push({
        role: role.label,
        type: 'mandatory',
        id: mandatory.id,
        startDate: mandatory.startDate,
        endDate: mandatory.endDate,
        administrativeUnit,
      });
    }

    for (let agent of agents) {
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
    return {
      person,
      positions,
    };
  }
}
