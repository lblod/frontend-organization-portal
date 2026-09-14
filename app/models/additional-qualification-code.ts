import Model, { attr } from '@warp-drive/legacy/model';
import { Type } from '@warp-drive/core/types/symbols';

export const ADDITIONAL_QUALIFICATIONS = {
  NONE: 'f877fae8-5101-4513-871c-4dd2151b0c99',
};

export default class AdditionalQualificationCode extends Model {
  @attr declare label: string;
  @attr declare definition: string;
  @attr declare legalBasis: string;

  declare [Type]: 'additional-qualification-code';
}
