import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import fetch from 'fetch';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';

export default class HistoryDetailRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model({ id }) {
    const hist = this.modelFor('history').history.find((h) => h.id === id);
    const endpoint = `/history-changes/${hist.id}`;
    const data = await (await fetch(endpoint)).json();
    const entries = A(data.map((e) => e));
    return ArrayProxy.create({
      content: entries,
      count: entries.length,
      history: hist,
    });
  }
}
