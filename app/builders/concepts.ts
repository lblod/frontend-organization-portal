import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';

const LEGAL_FORM_SCHEME_ID = 'c3ff1a7f-c091-484d-8785-c8a5740573af';

/**
 * Builders for loading the concepts of a SKOS concept scheme from mu-cl-resources.
 * Pass the returned builder to `store.request`.
 */
function conceptsInSchemeQuery(
  schemeId: string,
  sort: string,
  pageSize: number,
) {
  return queryBuilder('concept', {
    sort,
    'page[size]': pageSize,
    'filter[in-scheme][:id:]': schemeId,
    include: 'in-scheme',
  });
}

/**
 * {@link conceptsInSchemeQuery} builder for the "Juridische vorm" concept scheme.
 */
export function legalFormsQuery() {
  return conceptsInSchemeQuery(LEGAL_FORM_SCHEME_ID, 'order', 30);
}
