/**
 * Check whether the address and contact data for an organization can be
 * edited. For administrative units the CLB app is the master of of the data,
 * for other types of organizations OP remains the master.
 * @param {{@link Organization}} organization - the model of the organization to
 *     be checked.
 * @returns {boolean} true if address and contact data should be editable
 */
export default function isContactEditableOrganization(organization) {
  return (
    organization.isPrivateOcmwAssociation ||
    organization.isAssociationOther ||
    organization.isCorporationOther
  );
}
