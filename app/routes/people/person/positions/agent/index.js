import Route from '@ember/routing/route';

export default class PeoplePersonPositionsAgentIndexRoute extends Route {
  async model() {
    let { person, agent } = this.modelFor('people.person.positions.agent');

    let boardPosition = await agent.boardPosition;
    let contact = await boardPosition.contactPoint;
    let address = await contact?.contactAddress;

    return {
      person,
      agent,
      address,
      contact,
    };
  }
}
