import Helper from '@ember/component/helper';
import { assert } from '@ember/debug';

export default class FindMembershipRoleHelper extends Helper {
  /**
   * Return the membership role for the membership relation between the two
   * provided organizations.
   * @param {*} positional - TODO
   */
  // TODO: implement
  compute(positional /*, named*/) {
    assert(
      'find-membership-role expects exactly two arguments',
      positional.length === 2
    );
    // const organization = positional[0];
    // const relatedOrganization = positional[1];

    // const tmp = await relatedOrganization.memberships;
    // if (tmp) {
    //   console.log(tmp);

    //   for (const membership in tmp) {
    //     if (membership.member.id === organization.id) {
    //       return membership.role.label;
    //     }
    //   }
    //   }
    return 'TODO';
  }
}
