import Component from '@glimmer/component';

export default class MembershipRoleSelectComponent extends Component {
  getMembershipRoleLabels(roleModels) {
    const roleLabels = new Set();
    roleModels.map((role) => {
      roleLabels.add(role.opLabel);
      roleLabels.add(role.inverseOpLabel);
    });

    return Array.from(roleLabels);
  }
}
