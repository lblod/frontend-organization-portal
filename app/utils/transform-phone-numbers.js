export function transformPhoneNumbers(tel) {
  if (tel) {
    tel = 'tel:' + tel;
  }
  return tel;
}
