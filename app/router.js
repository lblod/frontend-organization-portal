import EmberRouter from '@ember/routing/router';
import config from 'frontend-contact-hub/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('index', { path: '' });
  this.route('people', { path: '/personen' }, function () {
    this.route('person', { path: '/:id/' }, function () {
      this.route(
        'personal-information',
        { path: '/persoonlijke-gegevens' },
        function () {
          this.route('edit');
        }
      );
      this.route('positions', { path: '/posities' }, function () {
        this.route(
          'mandatory',
          { path: '/mandataris/:positionId/' },
          function () {}
        );
        this.route(
          'minister',
          { path: '/bedienaar/:positionId/' },
          function () {}
        );
      });
      this.route('contacts', function () {});
    });
  });
  this.route(
    'administrative-units',
    { path: '/bestuurseenheden' },
    function () {
      this.route('administrative-unit', { path: '/:id/' }, function () {
        this.route('core-data', { path: '/kerngegevens' }, function () {
          this.route('edit');
        });
        this.route('sites', { path: '/vestigingen' }, function () {
          this.route('site', { path: '/:siteId/' }, function () {
            this.route('edit');
          });
        });
        this.route(
          'governing-bodies',
          { path: '/bestuursorganen' },
          function () {
            this.route(
              'governing-body',
              { path: '/:governingBodyId/' },
              function () {
                this.route('mandatory', { path: '/mandataris' }, function () {
                  this.route('edit', { path: '/:mandatoryId/' });
                });
                this.route('edit');
              }
            );
          }
        );
        this.route('ministers', { path: '/bedienaren' }, function () {
          this.route('new', { path: '/nieuwe-bedienaar' });
        });
        this.route(
          'local-involvements',
          { path: '/betrokken-lokale-besturen' },
          function () {}
        );
      });
    }
  );
  this.route('login');
});
