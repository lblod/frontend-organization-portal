export default function convertRoleNames(role) {
  switch (role) {
    case 'ABBOrganisatiePortaalGebruiker-editeerder':
      return 'Editeerder';
    case 'ABBOrganisatiePortaalGebruiker-lezer':
      return 'Lezer';
    case 'ABBOrganisatiePortaalErediensten-editeerder':
      return 'Erediensten - Editeerder';
    case 'ABBOrganisatiePortaalErediensten-lezer':
      return 'Erediensten - Lezer';
  }
}
