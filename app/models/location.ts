import Model, {
  attr,
  hasMany,
  belongsTo,
  type AsyncHasMany,
} from '@warp-drive/legacy/model';
import type { Type } from '@warp-drive/core/types/symbols';
// @ts-expect-error: Not converted to TS yet
import type AdministrativeUnit from './administrative-unit';
import type Concept from './concept';

export default class Location extends Model {
  @attr declare label: string;
  @attr declare level: string;

  declare [Type]: 'location';

  @hasMany<AdministrativeUnit>('administrative-unit', {
    inverse: 'locatedWithin',
    async: true,
    polymorphic: true,
    as: 'location',
  })
  declare administrativeUnits: AsyncHasMany<AdministrativeUnit>;

  @hasMany<Location>('location', {
    inverse: 'locations',
    async: true,
  })
  declare locatedWithin: AsyncHasMany<Location>;

  @hasMany<Location>('location', {
    inverse: 'locatedWithin',
    async: true,
  })
  declare locations: AsyncHasMany<Location>;

  @belongsTo<Concept>('concept', {
    inverse: null,
    async: true,
  })
  declare exactMatch: Concept;

  isLocatedWithin(location: Location) {
    return (this as Location)
      .hasMany('locatedWithin')
      .ids()
      .includes(location.id);
  }
}
