// Based on these RFC issues:
// https://github.com/emberjs/rfcs/issues/590
// https://github.com/emberjs/rfcs/issues/600#issuecomment-595155795
export default class RedirectHandler {
  constructor(injections) {
    Object.assign(this, injections);
  }

  redirect() {}

  static create(injections) {
    return new this(injections);
  }
}
