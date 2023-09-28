export default function kboFormat(kbo) {
  if (!kbo || kbo.length !== 10) return '';

  return `${kbo.slice(0, 4)}.${kbo.slice(4, 7)}.${kbo.slice(7, 10)}`;
}
