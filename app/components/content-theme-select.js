import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';

const CONTENT_THEME_SCHEME_ID = 'b8a2c4d6-e9f1-4a3b-8c5d-7e2f9a1b3c4d';

export default class ContentThemeSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadContentThemesTask.perform();
  }

  loadContentThemesTask = task(async () => {
    const { content } = await this.store.request(
      queryBuilder('concept', {
        sort: 'label',
        'page[size]': 50,
        'filter[in-scheme][:id:]': CONTENT_THEME_SCHEME_ID,
        include: 'in-scheme',
      }),
    );

    return content;
  });
}
