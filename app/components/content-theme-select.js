import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

const CONTENT_THEME_SCHEME_ID = 'b8a2c4d6-e9f1-4a3b-8c5d-7e2f9a1b3c4d';

export default class ContentThemeSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadContentThemesTask.perform();
  }

  loadContentThemesTask = task(async () => {
    return await this.store.query('concept', {
      sort: 'label',
      'page[size]': 50,
      'filter[in-scheme][:id:]': CONTENT_THEME_SCHEME_ID,
      include: 'in-scheme',
    });
  });
}
