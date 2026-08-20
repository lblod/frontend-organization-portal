import Model, { attr } from '@warp-drive/legacy/model';
import { Type } from '@warp-drive/core/types/symbols';

export default class Concept extends Model {
  @attr declare label: string;
  @attr declare altLabel: string;
  @attr declare notation: string;

  declare [Type]: 'concept';
}
