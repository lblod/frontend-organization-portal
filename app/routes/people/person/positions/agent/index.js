import Route from '@ember/routing/route';

export default class PeoplePersonPositionsAgentIndexRoute extends Route {
  async model() {
    let { person, agent } = this.modelFor('people.person.positions.agent');

    let boardPosition = await agent.boardPosition;

    const governingBodiesInTime = await boardPosition.governingBodies;

    let governingBodies = [];
    let administrativeUnits = [];
    for (const governingBodyInTime of governingBodiesInTime.slice()) {
      const isTimeSpecializationOf =
        await governingBodyInTime.isTimeSpecializationOf;
      governingBodies.push(isTimeSpecializationOf);
      const administrativeUnit =
        await isTimeSpecializationOf.administrativeUnit;
      administrativeUnits.push(administrativeUnit);
    }

    let contact = await boardPosition.contactPoint;
    let address = await contact?.contactAddress;

    return {
      person,
      agent,
      address,
      contact,
      governingBodiesInTime,
      governingBodies,
      administrativeUnits,
    };
  }
}
