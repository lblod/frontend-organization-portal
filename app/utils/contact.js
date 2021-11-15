export async function findPrimaryContact(contacts) {
  // TODO: We should label the contact records instead of using the address to mark a record primary
  let primaryContact;
  for (let contact of contacts) {
    let address = await contact.contactAddress;

    if (address) {
      primaryContact = contact;
      break;
    }
  }
  return primaryContact;
}
