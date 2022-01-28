import Route from '@ember/routing/route';
import { assert } from '@ember/debug';

export default class PeoplePersonPersonalInformationIndexRoute extends Route {
  async model() {
    const personInfo = await this.modelFor(
      'people.person.personal-information'
    );
    const mandatories = personInfo.person.mandatories
      .filter(this.isActivePosition)
      .sort((a, b) => {
        return new Date(b.startDate) - new Date(a.startDate);
      });
    return {
      person: personInfo.person,
      mandatories: mandatories,
    };
  }

  isActivePosition(mandatory) {
    let endDate = mandatory.endDate;
    if (!endDate) {
      // No end date set, so the position is still active
      return true;
    } else {
      return isDateInTheFuture(endDate);
    }
  }
}
function isDateInTheFuture(date) {
  assert('endDate should be a Date instance', date instanceof Date);
  let today = new Date();

  return date - today >= 0;
}
