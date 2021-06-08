import EmberRouter from '@ember/routing/router';
import config from 'frontend-contact-hub/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('index', { path: '' });
  this.route('people', function() {
    this.route('person');
  });
  this.route('administrative-units', function () {
    this.route('administrative-unit', { path: '/:id' });
  });
});
