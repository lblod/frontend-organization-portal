import { CLASSIFICATION_CODES_WITHOUT_ADDITIONAL_QUALIFICATIONS } from 'frontend-organization-portal/constants/classification';

export default function requiresAdditionalQualifications(classification?: {
  id: string;
}) {
  return (
    classification?.id &&
    !CLASSIFICATION_CODES_WITHOUT_ADDITIONAL_QUALIFICATIONS.includes(
      classification.id,
    )
  );
}
