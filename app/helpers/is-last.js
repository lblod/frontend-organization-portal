export default function isLast(maybeLastItem, list) {
  let lastIndex = list.length - 1;
  return list[lastIndex] === maybeLastItem;
}
