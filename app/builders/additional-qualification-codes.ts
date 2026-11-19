import { query } from '@warp-drive/legacy/compat/builders';
import type AdditionalQualificationCode from 'frontend-organization-portal/models/additional-qualification-code';

/**
 * {@link query} builder for loading all the additional qualification codes.
 * There are currently 21 records in the DB, ensure this number is big enough to load all of them at once.
 * Pass the returned builder to `store.request`.
 */
export function additionalQualificationCodesQuery() {
  return query<AdditionalQualificationCode>('additional-qualification-code', {
    'page[size]': 21,
    sort: 'label',
  });
}
