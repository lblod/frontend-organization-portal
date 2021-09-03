import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

const FINANCING_CODE = {
  SELF_FINANCED: '997073905f839ac6bafe92b76050ab0b',
  FOD_FINANCED: '9d6f49b3d923b437ec3a91e8b5fa6885',
};

export default class PeoplePersonPositionsMinisterEditController extends Controller {
  @service router;

  @tracked willReceiveFinancing;

  @dropTask
  *save(event) {
    event.preventDefault();

    let contacts = yield this.model.minister.contacts;
    let address = yield contacts.firstObject.contactAddress;

    if (address.isNew || address.hasDirtyAttributes) {
      address.fullAddress = combineFullAddress(address);
      yield address.save();
    }

    yield contacts.firstObject.save();

    let financingCodeId = this.willReceiveFinancing
      ? FINANCING_CODE.FOD_FINANCED
      : FINANCING_CODE.SELF_FINANCED;

    let financing = yield this.store.findRecord(
      'financing-code',
      financingCodeId,
      {
        backgroundReload: false,
      }
    );

    this.model.minister.financing = financing;
    yield this.model.minister.save();

    this.router.transitionTo(
      'people.person.positions.minister',
      this.model.minister.id
    );
  }
}
