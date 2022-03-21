import EmberRouter from '@ember/routing/router';
import config from 'frontend-organization-portal/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');
  this.route('mock-login');
  this.route('index', { path: '' });
  this.route('people', { path: '/personen' }, function () {
    this.route('new-position', { path: '/nieuw-positie' });
    this.route('person', { path: '/:id/' }, function () {
      this.route(
        'personal-information',
        { path: '/contactgegevens' },
        function () {
          this.route('edit');
        }
      );
      this.route('positions', { path: '/posities' }, function () {
        this.route(
          'mandatory',
          { path: '/mandataris/:mandatoryId/' },
          function () {}
        );
        this.route(
          'minister',
          { path: '/bedienaar/:ministerId/' },
          function () {
            this.route('edit');
          }
        );
      });
    });
    this.route('new', { path: '/nieuw' });
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
          this.route('new', { path: '/nieuwe-vestiging' });
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
                  this.route('new', { path: '/nieuw' });
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
          function () {
            this.route('edit');
          }
        );
        this.route(
          'change-events',
          { path: '/veranderingsgebeurtenissen' },
          function () {
            this.route('details', { path: '/:changeEventId' }, function () {
              this.route('edit');
            });
            this.route('new', { path: '/nieuw' });
          }
        );
      });
      this.route('new', { path: '/nieuwe-bestuurseenheid' });
    }
  );
  this.route('organizations', { path: '/organisaties' }, function () {
    this.route('organization', { path: '/:id/' }, function () {});
  });
  this.route('contact');
  this.route('legal', { path: '/legaal' }, function () {
    this.route('disclaimer');
    this.route('cookiestatement', { path: '/cookieverklaring' });
    this.route('accessibilitystatement', {
      path: '/toegankelijkheidsverklaring',
    });
  });
  this.route('sparql');
  this.route('route-not-found', {
    path: '/*wildcard',
  });
  this.route('redirect');
});
