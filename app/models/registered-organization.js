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
      // NOTE:The requested functionality was to *not* validate memberships of
      // already existing organizations. When creating a new organization a
      // mandatory membership is enforced by providing a `true` value for
      // `creatingNewOrganization`.
      memberships: Joi.when(Joi.ref('$creatingNewOrganization'), {
        is: Joi.exist().valid(true),
        then: validateHasManyNotEmptyRequired(REQUIRED_MESSAGE),
        otherwise: validateHasManyOptional(),
      }),
    });
  }

  get isOcmwAssociation() {
    return this._hasClassificationId(OcmwAssociationCodeList);
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
