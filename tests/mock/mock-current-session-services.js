import Service from '@ember/service';

class MockUnitCurrentSessionService extends Service {
  get hasWorshipRole() {
    return false;
  }

  get hasUnitRole() {
    return true;
  }

  get canEdit() {
    return false;
  }

  get canOnlyRead() {
    return false;
  }
}

class MockWorshipCurrentSessionService extends Service {
  get hasWorshipRole() {
    return true;
  }

  get hasUnitRole() {
    return false;
  }

  get canEdit() {
    return false;
  }

  get canOnlyRead() {
    return false;
  }
}

class MockNoRoleCurrentSessionService extends Service {
  get hasWorshipRole() {
    return false;
  }

  get hasUnitRole() {
    return false;
  }

  get canEdit() {
    return false;
  }

  get canOnlyRead() {
    return false;
  }
}

export {
  MockUnitCurrentSessionService,
  MockWorshipCurrentSessionService,
  MockNoRoleCurrentSessionService,
};
