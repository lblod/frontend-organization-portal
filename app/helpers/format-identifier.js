export default function formatIdentifier(identifier) {
  return identifier.replace(/[^\w]/gi, '');
}
