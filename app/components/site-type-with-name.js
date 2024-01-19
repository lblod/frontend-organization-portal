import Component from '@glimmer/component';
export default class SiteTypeWithName extends Component {
    isAndereVestigeng() {
        return this.args.site.siteType && this.args.site.siteType.get('id') === 'dcc01338-842c-4fbd-ba68-3ca6f3af975c'
    }
}