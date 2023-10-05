import { helper } from '@ember/component/helper';

export function formatIdentifier([identifier]) {
  return identifier.replace(/[^a-z0-9]/gi, '');
}

export default helper(formatIdentifier);
