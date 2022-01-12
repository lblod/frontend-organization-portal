import fetch from 'fetch';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';

function sortOrder(sort) {
  if (sort.startsWith('-')) {
    return 'desc';
  }
  if (sort.length > 0) {
    return 'asc';
  }
  return null;
}

function stripSort(sort) {
  return sort.replace(/(^\+)|(^-)/g, '');
}

async function muSearch(index, page, size, sort, filter, dataMapping) {
  const endpoint = new URL(`/search/${index}/search`, window.location.origin);
  const params = new URLSearchParams(
    Object.entries({
      'page[size]': size,
      'page[number]': page,
    })
  );

  for (const field in filter) {
    let q = filter[field];
    let f = field;
    if (q.includes('*')) {
      f = `:wildcard:${f}`;
    }
    params.append(`filter[${f}]`, q);
  }

  if (sort) {
    console.log(sort);
    params.append(`sort[${stripSort(sort)}.field]`, sortOrder(sort));
  }

  endpoint.search = params.toString();

  const { count, data } = await (await fetch(endpoint)).json();
  const pagination = getPaginationMetadata(page, size, count);
  const entries = A(data.map(dataMapping));

  return ArrayProxy.create({
    content: entries,
    meta: {
      count,
      pagination,
    },
  });
}
function getPaginationMetadata(pageNumber, size, total) {
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
export default muSearch;
