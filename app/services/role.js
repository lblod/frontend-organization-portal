import Service from '@ember/service';
import fetch from 'fetch';
import { tracked } from '@glimmer/tracking';

const GET_ACTIVE_ROLE_ENDPOINT = '/active-role/current';
const DESTROY_ACTIVE_ROLE_ENDPOINT = '/active-role/destroy';
const UPDATE_ACTIVE_ROLE_ENDPOINT = '/active-role/update';

export default class RoleService extends Service {
  @tracked _activeRole;

  async loadActiveRole() {
    try {
      if (this._activeRole) {
        return;
      }
      const resp = await fetch(GET_ACTIVE_ROLE_ENDPOINT, {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        body: null,
      });

      let activeRole = await resp.json();
      this._activeRole = activeRole.activeRole;
    } catch (e) {
      console.error(`active role not set ${e}`);
    }
  }
  async destroyActiveRole() {
    this._activeRole = null;
    try {
      await fetch(DESTROY_ACTIVE_ROLE_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        body: null,
      });
    } catch (e) {
      console.error(`active role not set ${e}`);
    }
  }

  async updateActiveRole(role) {
    const resp = await fetch(`${UPDATE_ACTIVE_ROLE_ENDPOINT}?role=${role}`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: null,
    });
    await resp.json();
    this._activeRole = role;
  }
  get activeRole() {
    return this._activeRole;
  }
}
