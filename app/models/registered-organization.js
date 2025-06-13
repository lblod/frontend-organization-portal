import {
  OcmwAssociationCodeList,
  PrivateOcmwAssociationCodeList,
  CorporationOtherCodeList,
  AssociationOtherCodeList,
} from '../constants/Classification';
import Joi from 'joi';
import {
  validateHasManyNotEmptyRequired,
  validateHasManyOptional,
} from '../validators/schema';
import { CLASSIFICATION } from './administrative-unit-classification-code';
import OrganizationModel from './organization';

export default class RegisteredOrganizationModel extends OrganizationModel {
  get validationSchema() {
    const REQUIRED_MESSAGE = 'Selecteer een optie';
    return super.validationSchema.append({
      // NOTE: The requested functionality was to *not* validate memberships of
      // already existing organizations.
      // 1. For existing organizations: memberships are not validated (optional).
      // 2. For new organizations:
      //    a. 'Vennootschappen' and 'Verenigingen' (corporations and associations):
      //       memberships are optional.
      //    b. All other types: memberships are mandatory.
      // The creatingNewOrganization flag (set to true) triggers validation for new organizations.'
      memberships: Joi.when(Joi.ref('$creatingNewOrganization'), {
        is: Joi.exist().valid(true),
        then: Joi.when('classification.id', {
          is: Joi.exist().valid(
            ...CorporationOtherCodeList,
            ...AssociationOtherCodeList,
          ),
          then: validateHasManyOptional(),
          otherwise: validateHasManyNotEmptyRequired(REQUIRED_MESSAGE),
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

  get isAssociationOther() {
    return this._hasClassificationId(AssociationOtherCodeList);
  }

  get isCorporationOther() {
    return this._hasClassificationId(CorporationOtherCodeList);
  }

  get participantClassifications() {
    if (this.isOcmwAssociation) {
      return OcmwAssociationCodeList.concat([
        CLASSIFICATION.MUNICIPALITY.id,
        CLASSIFICATION.OCMW.id,
        CLASSIFICATION.ASSOCIATION_OTHER.id,
        CLASSIFICATION.CORPORATION_OTHER.id,
      ]);
    }
    return [];
  }

  get founderClassifications() {
    if (this.isOcmwAssociation) {
      return OcmwAssociationCodeList.concat([
        CLASSIFICATION.MUNICIPALITY.id,
        CLASSIFICATION.OCMW.id,
        CLASSIFICATION.ASSOCIATION_OTHER.id,
        CLASSIFICATION.CORPORATION_OTHER.id,
      ]);
    }
    return [];
  }
}
