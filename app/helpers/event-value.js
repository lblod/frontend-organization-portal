export default function eventValue(handler) {
  return function (event) {
    return handler(event.target.value);
  };
}
