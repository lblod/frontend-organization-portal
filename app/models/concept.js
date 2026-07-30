import Model, { attr } from '@warp-drive/legacy/model';

export default class ConceptsModel extends Model {
  @attr label;
  @attr altLabel;
  @attr notation;
}
