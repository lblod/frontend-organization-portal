/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
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
    givenName: { replace: true },
    familyName: { replace: true },
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
    let query = {
      // Includes slow down the API response so we disable them for now.
      // include: [
      //   'mandatories.status',
      //   'mandatories.mandate.governing-body.is-time-specialization-of.administrative-unit',
      //   'mandatories.mandate.role-board',
      // ].join(),
      page: {
        number: params.page,
        size: params.size,
      },
      sort: params.sort,
    };

    if (params.givenName) {
      query['filter[given-name]'] = params.givenName;
    }

    if (params.familyName) {
      query['filter[family-name]'] = params.familyName;
    }

    if (params.organization) {
      query[
        'filter[mandatories][mandate][governing-body][is-time-specialization-of][administrative-unit][name]'
      ] = params.organization;
    }

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

    if (params.givenName) {
      q.push(`filter[given_name]=${params.givenName}`);
    }

    if (params.familyName) {
      q.push(`filter[family_name]=${params.familyName}`);
    }

    if (params.organization) {
      q.push(`filter[mandates.organization_name]=${params.organization}`);
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

    //return yield this.store.query('person', query);
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
    const workaround = JSON.parse(
      JSON.stringify(res.attributes).replace(/(_\w)/g, (entry) =>
        entry[1].toUpperCase()
      )
    );

    let frankensteinObj = {
      id: res.id,
      familyName: workaround.familyName,
      givenName: workaround.givenName,
      firstNameUsed: workaround.firstNameUsed,
      uri: workaround.uri,
    };
    let tempMandates = workaround.mandates;
    if (!tempMandates) {
      tempMandates = [];
    }
    if (!Array.isArray(tempMandates)) {
      tempMandates = [tempMandates];
    }
    const mandates = tempMandates.map((m) => {
      let copy = { ...frankensteinObj };
      if (m.endDate) {
        copy.endDate = new Date(m.endDate);
        console.log(copy.endDate);
      }
      copy.organizationId = m.organizationId;
      copy.organizationMunicipality = m.organizationMunicipality;
      copy.organizationName = m.organizationName;
      copy.organizationProvince = m.organizationProvince;
      copy.positionId = m.positionId;
      copy.positionName = m.positionName;
      copy.mandatoryId = m.uuid;
      return copy;
    });
    if (!mandates.length) {
      return [frankensteinObj];
    }
    return mandates;
  }
}
