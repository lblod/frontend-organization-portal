import { assert } from '@ember/debug';

const CONFIRMATION_MESSAGE_TEXT = {
  nonActiveRelatedOrganization:
    'Opgelet, je hebt een niet actieve organisatie geselecteerd. Ben je zeker dat je deze relatie wenst toe te voegen?',
};

export default function confirmationMessageText(key) {
  assert(
    `{{confirmation-message-text}}: No confirmation message text value found for "${key}"`,
    Boolean(CONFIRMATION_MESSAGE_TEXT[key]),
  );
  return CONFIRMATION_MESSAGE_TEXT[key];
}
