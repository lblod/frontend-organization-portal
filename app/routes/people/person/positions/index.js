import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonPositionsIndexRoute extends Route {
  @service store;

  async model() {
    let { id: personId } = this.paramsFor('people.person');

    let person = await this.store.findRecord('person', personId, {
      reload: true,
      include: [
        'mandatories.mandate.role-board',
        'mandatories.mandate.governing-body.is-time-specialization-of.administrative-unit',
        'agents-in-position',
        'agents-in-position.position.function',
        'agents-in-position.position.worship-service',
      ].join(),
    });
    const positions = [];
    const mandatories = person.mandatories.toArray();

    const ministers = person.agentsInPosition.toArray();

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
