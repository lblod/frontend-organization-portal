import Service from '@ember/service';
import fetch from 'fetch';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';

export default class MuSearchService extends Service {
  sortOrder(sort) {
    if (sort.startsWith('-')) {
      return 'desc';
    }
    if (sort.length > 0) {
      return 'asc';
    }
    return null;
  }
  stripSort(sort) {
    return sort.replace(/(^\+)|(^-)/g, '');
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

  async search(request) {
    let { index, page, size, sort, filters, dataMapping } = request;
    const params = [];
    params.push(`page[size]=${size}`);
    params.push(`page[number]=${page}`);

    for (const field in filters) {
      let q = filters[field];
      let f = field;
      params.push(`filter[${f}]=${q}`);
    }

    if (sort) {
      const sortParams = sort.split(',');
      sortParams.forEach((sortParam) => {
        params.push(
          `sort[${this.stripSort(sortParam)}.field]=${this.sortOrder(
            sortParam
          )}`
        );
      });
    }

    const endpoint = `/search/${index}/search?${params.join('&')}`;
    const { count, data } = await (await fetch(endpoint)).json();
    const pagination = this.getPaginationMetadata(page, size, count);
    const entries = A(data.flatMap(dataMapping));

    return ArrayProxy.create({
      content: entries,
      meta: {
        count,
        pagination,
      },
    });
  }
}
