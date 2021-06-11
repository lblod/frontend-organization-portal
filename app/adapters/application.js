import JSONAPIAdapter from '@ember-data/adapter/json-api';

export default class ApplicationAdapter extends JSONAPIAdapter {
  get headers() {
    return {
      'Authorization': 'Basic cm9vdDpyb290'
    };
  }
}
