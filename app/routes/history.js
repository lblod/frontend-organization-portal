import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';

export default class HistoryIndexRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const endpoint = '/history-changes';
    const data = await (await fetch(endpoint)).json();
    const entries = A(
      data.map((e) => {
        return {
          ...e,
          dateCreation: new Date(e.dateCreation).toLocaleString('en-GB', {
            hour12: false,
          }),
        };
      })
    );
    return ArrayProxy.create({
      content: entries,
      count: entries.length,
    });
  }
}
