import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';
import { keepLatestTask } from 'ember-concurrency';

export default class HistoryIndexRoute extends Route {
  @service session;
  queryParams = {
    page: { refreshModel: true },
  };
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  getPaginationMetadata(pageNumber, size, total) {
    const pagination = {};

    pagination.first = {
      number: 0,
      size,
    };

    const lastPageNumber =
      total % size === 0
        ? Math.floor(total / size) - 1
        : Math.floor(total / size);
    const lastPageSize = total % size === 0 ? size : total % size;
    pagination.last = {
      number: lastPageNumber,
      size: lastPageSize,
    };

    pagination.self = {
      number: pageNumber,
      size,
    };

    if (pageNumber > 0) {
      pagination.prev = {
        number: pageNumber - 1,
        size,
      };
    }

    if (pageNumber < lastPageNumber) {
      const nextPageSize =
        pageNumber + 1 === lastPageNumber ? lastPageSize : size;
      pagination.next = {
        number: pageNumber + 1,
        size: nextPageSize,
      };
    }

    return pagination;
  }

  async model(params) {
    return {
      loadHistoriesTaskInstance: this.loadHistoriesTask.perform(params),
      loadedHistoriesTask: this.loadHistoriesTask.lastSuccessful?.value,
    };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadHistoriesTask(params) {
    const endpoint = `/history-changes?pageSize=10&pageNumber=${params.page}`;

    const { count, content } = yield (yield fetch(endpoint)).json();
    const pagination = this.getPaginationMetadata(
      params.page,
      content.length,
      count
    );
    const entries = A(
      content.map((e) => {
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
      meta: {
        count,
        pagination,
      },
    });
  }
}
