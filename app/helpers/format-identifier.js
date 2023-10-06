import { helper } from '@ember/component/helper';

export function formatIdentifier([identifier]) {
  return identifier.replace(/[^\w]/gi, '');
}

export default helper(formatIdentifier);
