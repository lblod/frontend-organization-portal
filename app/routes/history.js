import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';

export default class HistoryRoute extends Route {
  @service session;
  queryParams = {
    page: { refreshModel: true },
    fromDate: { refreshModel: true },
    toDate: { refreshModel: true },
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
      history: await this.loadHistoriesTask(params),
    };
  }

  //@keepLatestTask({ cancelOn: 'deactivate' })
  async loadHistoriesTask(params) {
    let endpoint = `/history-changes?pageSize=10&pageNumber=${params.page}`;
    if (params.fromDate && params.toDate) {
      endpoint += `&fromDate=${params.fromDate}&toDate=${params.toDate}`;
    }

    const { count, content } = await (await fetch(endpoint)).json();
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
