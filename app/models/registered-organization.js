import Joi from 'joi';
import {
  validateHasManyNotEmptyRequired,
  validateHasManyOptional,
  validateBelongsToOptional,
  validateBelongsToRequired,
} from '../validators/schema';
import {
  AndereCodeList,
  BosgroepCodeList,
  OcmwAssociationCodeList,
  PrivateOcmwAssociationCodeList,
  RegionaalLandschapCodeList,
  RegionaalZorgplatformCodeList,
  WoonmaatschappijCodeList,
  ZorgraadCodeList,
} from '../constants/classification';
import OrganizationModel from './organization';
import { belongsTo } from '@warp-drive/legacy/model';

export default class RegisteredOrganizationModel extends OrganizationModel {
  // Werkingsgebied (dct:spatial on registered organizations). User-entered.
  @belongsTo('location', {
    inverse: null,
    async: true,
  })
  scope;

  get validationSchema() {
    const REQUIRED_MESSAGE = 'Selecteer een optie';
    return super.validationSchema.append({
      // Werkingsgebied: required for the new types that have one, optional for the rest.
      scope: Joi.when('classification.id', {
        is: Joi.exist().valid(
          ...ZorgraadCodeList,
          ...RegionaalZorgplatformCodeList,
          ...RegionaalLandschapCodeList,
          ...BosgroepCodeList,
          ...WoonmaatschappijCodeList,
          ...PrivateOcmwAssociationCodeList,
        ),
        then: validateBelongsToRequired(REQUIRED_MESSAGE),
        otherwise: validateBelongsToOptional(),
      }),
      // NOTE: memberships are only validated when creating a new organization
      // (`creatingNewOrganization`). Every type needs at least one related
      // organization then, except Woonmaatschappijen whose fields are all
      // optional in the OP-3929 rules.
      memberships: Joi.when(Joi.ref('$creatingNewOrganization'), {
        is: Joi.exist().valid(true),
        then: Joi.when('classification.id', {
          is: Joi.exist().valid(...WoonmaatschappijCodeList),
          then: validateHasManyOptional(),
          otherwise: validateHasManyNotEmptyRequired(
            'Kies minstens 1 gerelateerde organisatie',
          ),
        }),
        otherwise: validateHasManyOptional(),
      }),
    });
  }

  get isOcmwAssociation() {
    return this._hasClassificationId(OcmwAssociationCodeList);
  }

  get displayRegion() {
    return this.isOcmwAssociation;
  }

  get isPrivateOcmwAssociation() {
    return this._hasClassificationId(PrivateOcmwAssociationCodeList);
  }

  get isAndere() {
    return this._hasClassificationId(AndereCodeList);
  }

  get isZorgraad() {
    return this._hasClassificationId(ZorgraadCodeList);
  }

  get isRegionaalZorgplatform() {
    return this._hasClassificationId(RegionaalZorgplatformCodeList);
  }

  get isRegionaalLandschap() {
    return this._hasClassificationId(RegionaalLandschapCodeList);
  }

  get isBosgroep() {
    return this._hasClassificationId(BosgroepCodeList);
  }

  get isWoonmaatschappij() {
    return this._hasClassificationId(WoonmaatschappijCodeList);
  }
}
