import { action } from '@ember/object';
import Component from '@glimmer/component';
const LANDMARKS = ['aside', 'footer', 'form', 'header', 'main', 'nav'];

/**
 * TODO workaround for Issue https://github.com/appuniversum/ember-appuniversum/issues/273
 * once fixed in appuniversum, we must drop this component & use the standard one again
 */
export default class CustomModal extends Component {
  get destinationElement() {
    return document.getElementById('ember-appuniversum-wormhole');
  }

  get size() {
    if (this.args.size === 'fullscreen') return 'au-c-modal--fullscreen';
    if (this.args.size === 'large') return 'au-c-modal--large';
    else return '';
  }

  get padding() {
    if (this.args.padding === 'none') return ' au-c-modal--flush';
    else return '';
  }

  get title() {
    if (this.args.title) {
      return this.args.title;
    } else {
      return undefined;
    }
  }

  @action
  setInert(toggle) {
    let landmarkElements = document.querySelectorAll(LANDMARKS);

    this.destinationElement.inert = toggle;

    landmarkElements.forEach(function (landmarkElement) {
      if (landmarkElement.parentElement === document.body) {
        landmarkElement.inert = !toggle;
      }
    });
  }

  @action
  closeModal() {
    this.setInert(true);
    this.args.closeModal?.();
  }
}
