import Model, { attr } from '@ember-data/model';
export default class OrganizationClassificationCodeModel extends Model {
  @attr label;
  @attr altLabel;

  // Combined label so the type picker can match on the colloquial werkingsgebied
  // term as well (e.g. typing "eerstelijnszone" finds "Zorgraad").
  get searchLabel() {
    return this.altLabel ? `${this.label} ${this.altLabel}` : this.label;
  }
}
