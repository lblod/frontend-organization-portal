import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';

const LEGAL_FORM_SCHEME_ID = 'c3ff1a7f-c091-484d-8785-c8a5740573af';
const CONTENT_THEME_SCHEME_ID = 'b8a2c4d6-e9f1-4a3b-8c5d-7e2f9a1b3c4d';

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

/**
 * {@link conceptsInSchemeQuery} builder for the "Inhoudelijk thema" concept scheme.
 */
export function contentThemesQuery() {
  return conceptsInSchemeQuery(CONTENT_THEME_SCHEME_ID, 'label', 50);
}
