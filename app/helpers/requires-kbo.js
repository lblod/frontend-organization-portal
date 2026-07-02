export default function requiresKbo(organization) {
  // ILV and Vervoerregioraad have no KBO number, so KBO is optional for them.
  return !(
    organization.isInterlokaleVereniging || organization.isVervoerregioraad
  );
}
