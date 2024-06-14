import {
  OcmwAssociationCodeList,
  PrivateOcmwAssociationCodeList,
  CorporationOtherCodeList,
  AssociationOtherCodeList,
} from '../constants/Classification';
import {
  validateHasManyOptional,
  validateRequiredWhenClassificationId,
} from '../validators/schema';
import { CLASSIFICATION } from './administrative-unit-classification-code';
import OrganizationModel from './organization';
import Joi from 'joi';

export default class RegisteredOrganizationModel extends OrganizationModel {
  get validationSchema() {
    const REQUIRED_MESSAGE = 'Selecteer een optie';
    return super.validationSchema.append({
      wasFoundedByOrganizations: Joi.when(
        // Note: For OCMW associations and PEVAs a founding organisation is
        // normally mandatory. But the available business data when onboarding
        // them was incomplete in this respect. Therefore, we opted to relax
        // this rule for the OCMW associations and PEVAs imported during the
        // onboarding. The `relaxMandatoryFoundingOrganization` option allows us
        // to specify that a founding organisation is not mandatory in, for
        // example, the edit core data form. Otherwise, the form validation
        // would prevent editing the core data of the imported organisations due
        // to the lack of founding organisation.
        Joi.ref('$relaxMandatoryFoundingOrganization'),
        {
          is: Joi.exist().valid(true),
          then: validateHasManyOptional(),
          otherwise: validateRequiredWhenClassificationId(
            OcmwAssociationCodeList,
            REQUIRED_MESSAGE
          ),
        }
      ),
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
