import Model, { attr, hasMany } from '@warp-drive/legacy/model';
import { Type } from '@warp-drive/core/types/symbols';
//@ts-expect-error: Not converted to TS yet
import type Organization from './organization';

export const NO_PROVENANCE_VENDOR_ID = 'none';

export default class Vendor extends Model {
  declare [Type]: 'vendor';

  @attr declare name?: string;
  @attr declare uri?: uri;

  @hasMany<Organization>('organization', {
    inverse: 'vendors',
    async: true,
    polymorphic: true,
    as: 'vendor',
  })
  declare organizations: Organization[];
}
