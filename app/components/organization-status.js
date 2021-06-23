import Component from '@glimmer/component';

const ORGANIZATION_STATUS_SKINS = {
  '63cc561de9188d64ba5840a42ae8f0d6': 'success',
  abf4fee82019f88cf122f986830621ab: 'warning',
  d02c4e12bf88d2fdf5123b07f29c9311: 'error',
};

export default class OrganizationStatusComponent extends Component {
  get statusSkin() {
    console.log(this.args.status);
    return ORGANIZATION_STATUS_SKINS[this.args.status.id];
  }
}
