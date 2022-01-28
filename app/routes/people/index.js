import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import fetch from 'fetch';

import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';

export default class PeopleIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
    status: { refreshModel: true },
    positie: { refreshModel: true },
    name: { replace: true },
    organization: { replace: true },
  };

  model(params) {
    return {
      loadPeopleTaskInstance: this.loadPeopleTask.perform(params),
      loadedPeople: this.loadPeopleTask.lastSuccessful?.value,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadPeopleTask(params) {
    const transformFieldForElk = (text) => text.replace(/-/g, '_');
    // MU SEARCH
    let q = [];
    if (params.sort) {
      let direction = 'asc';
      let sortBy = params.sort;
      if (sortBy.startsWith('-')) {
        direction = 'desc';
        sortBy = sortBy.substring(1);
      }
      q.push(`sort[${transformFieldForElk(sortBy)}.field]=${direction}`);
    }
    q.push(`page[number]=${params.page}`);
    q.push(`page[size]=${params.size}`);

    if (params.name) {
      q.push(`filter[given_name,family_name]=${params.name}`);
    }
    if (params.status) {
      let date = new Date().toISOString().slice(0, -5);
      q.push(
        `filter[:query:end_date]= (NOT (_exists_:end_date))  OR (end_date:[${date} TO *] ) `
      );
    }

    if (params.positie) {
      q.push(`filter[position_id]=${params.positie}`);
    }

    if (params.organization) {
      q.push(`filter[organization_id]=${params.organization}`);
    }
    const response = yield fetch(`/search/people/search?${q.join('&')}`);
    const { count, data } = yield response.json();
    const pagination = this.getPaginationMetadata(
      params.page,
      params.size,
      count
    );

    const entries = A(data.map(this.mapResult).flat());

    return ArrayProxy.create({
      content: entries,
      meta: {
        count,
        pagination,
      },
    });
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

  // purpose of the poc. this is not intended to be prod ready
  mapResult(res) {
    let d = JSON.parse(
      JSON.stringify(res.attributes).replace(/(_\w)/g, (entry) =>
        entry[1].toUpperCase()
      )
    );
    let x = { ...d };
    x.endDate = d.endDate ? new Date(d.endDate) : null;
    return x;
  }
}
