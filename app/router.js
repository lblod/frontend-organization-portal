import EmberRouter from '@ember/routing/router';
import config from 'frontend-contact-hub/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('index', { path: '' });
  this.route('personen', function() {
    this.route('bestuurseenheden');
  });
  this.route('bestuurseenheden', function() {});
});
