import { belongsTo, attr } from '@warp-drive/legacy/model';
import OrganizationModel from './organization';

export default class KboOrganizationtModel extends OrganizationModel {
  @attr rechtsvorm;
  @attr startDate;
  @attr modified;

  @belongsTo('organization', {
    inverse: 'kboOrganization',
    async: true,
    as: 'organization',
    polymorphic: true,
  })
  organization;
}
