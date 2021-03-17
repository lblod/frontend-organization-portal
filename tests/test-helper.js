import Application from 'frontend-contact-hub/app';
import config from 'frontend-contact-hub/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

start();
