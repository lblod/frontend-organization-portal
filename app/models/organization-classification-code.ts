import Model, { attr } from '@warp-drive/legacy/model';

export default class OrganizationClassificationCodeModel extends Model {
  @attr declare label: string;
  @attr declare altLabel?: string;

  // Combined label so the type picker can match on the colloquial werkingsgebied
  // term as well (e.g. typing "eerstelijnszone" finds "Zorgraad").
  get searchLabel() {
    return this.altLabel ? `${this.label} ${this.altLabel}` : this.label;
  }
}
