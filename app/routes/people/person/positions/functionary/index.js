import Route from '@ember/routing/route';

export default class PeoplePersonPositionsFunctionaryIndexRoute extends Route {
  async model() {
    let { person, functionary } = this.modelFor(
      'people.person.positions.functionary'
    );

    let boardPosition = await functionary.boardPosition;

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
      functionary,
      address,
      contact,
      governingBodiesInTime,
      governingBodies,
      administrativeUnits,
    };
  }
}
