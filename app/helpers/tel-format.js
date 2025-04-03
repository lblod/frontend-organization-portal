import { assert } from '@ember/debug';

const NR_WITH_COUNTRY = /^(?:\+|00)(\d\d)(\d{8,12})$/;
const NR_WITHOUT_COUNTRY = /^0(\d{8,11})$/;
const SHORT_NR = /^\d{3,4}$/;
const FREE_NR = /^0800(\d{4,9})$/;
const NON_NUMERIC_CHARACTER = /[^\d+]/g;
const BE_COUNTRY_CODE = '32';
const singleDigitAreaCodes = ['2', '3', '4', '9'];

/**
 * Formats telephone numbers according to predefined patterns as documented on the Flemish taaladvies website:
 * https://www.vlaanderen.be/team-taaladvies/taaladviezen/telefoonnummers-notatie
 *
 * @param {string} tel - The telephone number to format.
 * @returns {string} Formatted telephone number.
 */
export default function telFormat(tel) {
  assert('expected a single phone number string', arguments.length === 1);

  if (!tel) return '';

  assert(
    'The first argument must be a phone number string',
    typeof tel === 'string',
  );

  assert(
    'The phone number string should not start with `tel:`. Please provide the raw number instead.',
    !tel.startsWith('tel:'),
  );

  const stripped = stripFormatting(tel);

  if (isShortNumber(stripped)) {
    // Short numbers don't require spaces
    return stripped;
  }

  if (isSpecialNumber(stripped)) {
    return formatSpecialNumber(stripped);
  }

  // At this point we assume we are dealing with regular phone numbers.
  // For simplicity's sake, we also assume the country code always consists of 2 numbers since that's case for
  // Belgian phone numbers and our neighboring countries and we don't have to keep a list that way.
  // When we need to support more we should start looking into libraries to parse the number for us.
  // Other country codes will still be formatted, but maybe not in the most ideal way.

  if (isRegularPhoneNumber(stripped)) {
    const normalized = normalizeNumber(stripped);
    const [, countryCode, digits] = normalized.match(NR_WITH_COUNTRY);

    if (countryCode === BE_COUNTRY_CODE) {
      let areaCodeLength = 2;

      // The mobile phone check needs to happen first, since 4 is also an area code
      if (digits.startsWith('4') && digits.length === 9) {
        areaCodeLength = 3;
      } else if (singleDigitAreaCodes.includes(digits.at(0))) {
        areaCodeLength = 1;
      }

      const areaCode = digits.substring(0, areaCodeLength);
      const subscriberNumber = digits.substring(areaCodeLength);

      return `+${countryCode} ${areaCode} ${formatSeriesDigitsNormal(subscriberNumber)}`;
    } else {
      return `+${countryCode} ${formatSeriesDigitsNormal(digits)}`;
    }
  } else {
    // We do not know what it is, or we don't officially support it yet, so do a best effort at formatting it.
    return formatSeriesDigitsNormal(stripped);
  }
}

/**
 * Detects if a string is a 3 or 4 digit number (112, 1733, ..)
 * @param {string} tel
 * @returns {boolean}
 */
function isShortNumber(tel) {
  return SHORT_NR.test(tel);
}

/**
 * Belgium has some special numbers which don't follow the same formatting rules as regular numbers
 * @param {string} tel
 * @returns {boolean}
 */
function isSpecialNumber(tel) {
  // TODO: 0800 numbers aren't the only special numbers in Belgium. We can widen our support if needed.
  // Special number examples: https://nl.wikipedia.org/wiki/Lijst_van_Belgische_zonenummers#Speciale_nummers
  return FREE_NR.test(tel);
}

/**
 * Converts a Belgian national number or 00 prefixed number to the international version
 * @param {string} tel
 * @returns {string} normalized number
 */
function normalizeNumber(tel) {
  if (/^\+\d+$/.test(tel)) {
    return tel;
  }

  if (tel.startsWith('00')) {
    return tel.replace('00', '+');
  }

  if (tel.startsWith('0')) {
    return tel.replace('0', '+32');
  }
}

function isRegularPhoneNumber(tel) {
  return isNationalPhoneNumber(tel) || isInternationalPhoneNumber(tel);
}

function isNationalPhoneNumber(tel) {
  return NR_WITHOUT_COUNTRY.test(tel);
}

function isInternationalPhoneNumber(tel) {
  return NR_WITH_COUNTRY.test(tel);
}

function stripFormatting(tel) {
  return tel.replace(NON_NUMERIC_CHARACTER, '');
}

function formatSpecialNumber(tel) {
  const match = tel.match(FREE_NR);
  const rest = match[1];
  return `0800 ${formatSeriesDigitsFree(rest)}`;
}

/**
 * Formats a series of digits into groups of two, separated by spaces.
 * Used for formatting the rest of a free number.
 * @param {string} digits - A string representing the series of digits.
 * @returns {string} Formatted string with digits grouped in twos.
 */
function formatSeriesDigitsFree(digits) {
  // Throw an error if there are less than 4 digits
  if (digits.length < 4)
    throw new Error('Stopping because of fewer than 4 numbers');

  let input = digits;
  const output = [];

  // Group the digits in pairs until there are less than 3 remaining
  while (input.length > 3) {
    output.push(input.slice(0, 2));
    input = input.slice(2);
  }
  // Push the remaining digits (less than 3) to the output array
  output.push(input.slice(0));

  return output.join(' ');
}

/**
 * Formats a series of digits into groups of two or three, separated by spaces.
 * Used for formatting the rest of a normal number.
 * @param {string} digits - A string representing the series of digits.
 * @returns {string} Formatted string with digits grouped in twos or threes.
 */
function formatSeriesDigitsNormal(digits) {
  // Throw an error if there are less than 4 digits
  if (digits.length < 4)
    throw new Error('Stopping because of fewer than 4 numbers');

  let input = digits;
  const output = [];

  // Take the first chunk of 3 or 2 digits
  if (digits.length % 2 === 0) {
    output.push(input.slice(0, 2));
    input = input.slice(2);
  } else {
    output.push(input.slice(0, 3));
    input = input.slice(3);
  }

  // Take the remaining digits in chunks of 2
  while (input.length > 0) {
    output.push(input.slice(0, 2));
    input = input.slice(2);
  }

  return output.join(' ');
}
