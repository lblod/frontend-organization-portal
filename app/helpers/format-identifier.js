import { helper } from '@ember/component/helper';

export function formatIdentifier([identifier]) {
  return identifier.replace(/[^a-zA-Z0-9]/gi, '');
}

export default helper(formatIdentifier);
