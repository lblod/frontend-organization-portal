import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { BLACKLIST_RO } from '../models/representative-body';
import { findAll } from '@warp-drive/legacy/compat/builders';

export default class RepresentativeBodySelectComponent extends Component {
  @service store;
  representativeBodies;

  constructor(...args) {
    super(...args);

    this.representativeBodies = this.loadRepresentativeBodiesTask.perform();
  }

  loadRepresentativeBodiesTask = task(async () => {
    const { content: representativeBodies } = await this.store.request(
      findAll('representative-body', { include: 'organization-status' }),
    );

    const filteredRepresentativeBodies = representativeBodies.filter((body) => {
      return !BLACKLIST_RO.find((item) => item == body.id);
    });

    return filteredRepresentativeBodies;
  });
}

<div class={{if @error "ember-power-select--error"}}>
  <PowerSelect
    @allowClear={{@allowClear}}
    @searchEnabled={{true}}
    @loadingMessage="Aan het laden..."
    @noMatchesMessage="Geen resultaten"
    @searchMessage="Typ om te zoeken"
    @searchField="name"
    @options={{this.representativeBodies}}
    @selected={{@selected}}
    @onChange={{@onChange}}
    @triggerId={{@id}}
    as |representativeBody|
  >
    {{representativeBody.abbName}}
  </PowerSelect>
</div>