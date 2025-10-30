import EmberRouter from '@embroider/router';
import config from 'frontend-organization-portal/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');

  this.route('mock-login');

  this.route('select-role');

  this.route('auth', { path: '/authorization' }, function () {
    this.route('callback');
    this.route('login');
    this.route('logout');
    this.route('switch');
  });

  this.route('index', { path: '' });

  this.route('people', { path: '/personen' }, function () {
    this.route('new-position', { path: '/nieuw-positie' });
    this.route('person', { path: '/:id/' }, function () {
      this.route(
        'personal-information',
        { path: '/contactgegevens' },
        function () {
          this.route('request-sensitive-data');
        },
      );
      this.route('positions', { path: '/posities' }, function () {
        this.route(
          'mandatory',
          { path: '/mandataris/:mandatoryId/' },
          function () {},
        );
        this.route(
          'minister',
          { path: '/bedienaar/:ministerId/' },
          function () {},
        );
        this.route(
          'functionary',
          { path: '/functionaris/:functionaryId/' },
          function () {},
        );
      });
    });
  });

  this.route('organizations', { path: '/organisaties' }, function () {
    this.route('organization', { path: '/:id/' }, function () {
      this.route('core-data', { path: '/kerngegevens' }, function () {
        this.route('edit');
      });

      this.route('sites', { path: '/vestigingen' }, function () {
        this.route('site', { path: '/:siteId/' }, function () {
          this.route('edit');
        });
        this.route('new', { path: '/nieuwe-vestiging' });
      });

      this.route('governing-bodies', { path: '/bestuursorganen' }, function () {
        this.route(
          'governing-body',
          { path: '/:governingBodyId/' },
          function () {
            this.route('edit');
          },
        );
      });

      this.route('ministers', { path: '/bedienaren' }, function () {});

      this.route('executives', { path: '/leidinggevenden' });

      this.route(
        'local-involvements',
        { path: '/betrokken-lokale-besturen' },
        function () {
          this.route('edit');
        },
      );

      this.route(
        'change-events',
        { path: '/veranderingsgebeurtenissen' },
        function () {
          this.route('details', { path: '/:changeEventId' }, function () {
            this.route('edit');
          });
          this.route('new', { path: '/nieuw' });
        },
      );

      this.route(
        'related-organizations',
        { path: '/gerelateerde-organisaties' },
        function () {
          this.route('edit');
        },
      );
    });
    this.route('new', { path: '/nieuwe-organisatie' });
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

  this.route('error', { path: '/*path' });
  this.route('unauthorized', { path: '/geen-toegang' });
  // eslint-disable-next-line ember/no-shadow-route-definition -- We need to shadow the error page, we don't want users to reach it by accident.
  this.route('route-not-found', {
    path: '/*wildcard',
  });

  this.route('redirect');

  // Added to redirect users from old, removed `administrative-unit` route to
  // the `organizations` route
  this.route(
    'administrative-units',
    { path: '/bestuurseenheden' },
    function () {
      this.route('index', { path: '/' });
      this.route('wildcard', { path: '/*path' });
    },
  );
});
