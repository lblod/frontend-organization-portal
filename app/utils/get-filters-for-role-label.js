import { ORGANIZATION_STATUS } from '../models/organization-status-code';

function getRoleModel(roleLabel, roles) {
  return roles.find(
    (r) => r.opLabel === roleLabel || r.inverseOpLabel === roleLabel,
  );
}

function getMembershipRelation(roleLabel, role) {
  if (role.opLabel === roleLabel) {
    return 'filter[member][:id:]';
  }
  if (role.inverseOpLabel === roleLabel) {
    return 'filter[organization][:id:]';
  }
}

export default function getFiltersForRoleLabel({
  roles,
  organization,
  roleLabel = undefined,
  status = undefined,
}) {
  const filters = new Map();
  const roleModel = getRoleModel(roleLabel, roles);

  if (!roleLabel || roleModel.hasRelationWith) {
    filters.set('filter[:or:][member][:id:]', organization.id);
    filters.set('filter[:or:][organization][:id:]', organization.id);
  } else {
    filters.set(getMembershipRelation(roleLabel, roleModel), organization.id);
  }

  if (roleLabel) {
    filters.set('filter[role][:id:]', roleModel.id);
  }

  if (status) {
    filters.set(
      'filter[member][organization-status][:id:]',
      ORGANIZATION_STATUS.ACTIVE,
    );
    filters.set(
      'filter[organization][organization-status][:id:]',
      ORGANIZATION_STATUS.ACTIVE,
    );
  }
  return filters;
}
