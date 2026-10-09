import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import {
  AgbCodeList,
  AndereCodeList,
  ApbCodeList,
  AssistanceZoneCodeList,
  AutonomeVerzorgingsinstellingCodeList,
  BosgroepCodeList,
  CentralWorshipServiceCodeList,
  DistrictCodeList,
  DienstverlenendeVerenigingCodeList,
  InterlokaleVerenigingCodeList,
  MunicipalityCodeList,
  OCMWCodeList,
  OpdrachthoudendeVerenigingCodeList,
  OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
  PevaMunicipalityCodeList,
  PevaProvinceCodeList,
  PoliceZoneCodeList,
  ProvinceCodeList,
  ProjectverenigingCodeList,
  RegionaalLandschapCodeList,
  RegionaalZorgplatformCodeList,
  RepresentativeBodyCodeList,
  VerenigingOfVennootschapVoorSocialeDienstverleningCodeList,
  VervoerregioraadCodeList,
  WelzijnsverenigingCodeList,
  WoonmaatschappijCodeList,
  WoonzorgverenigingCodeList,
  WorshipServiceCodeList,
  ZiekenhuisverenigingCodeList,
  ZorgraadCodeList,
} from 'frontend-organization-portal/constants/classification';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

// This file contains only data. The functions that read these tables to
// validate memberships or list the allowed roles and classification codes
// live in `frontend-organization-portal/utils/membership-rules`.

// Specifies which organization classifications are allowed as participants in
// other organization classifications. For each classification code in an
// `organizations` property the classification codes for the allowed kinds of
// participants are listed in the `members` property.
//
// For example,
// ```
// {
//   organizations: [...AgbCodeList],
//   members: [...MunicipalityCodeList],
// }
// ```
// means "an AGB can have as participant a municipality" as well as the inverse
// relation "a municipality can participate in an AGB".
//
// The tables below are derived from the OP-3929 rules file (version 3): every
// row of that file describes both directions of one relationship, so each row
// results in one `{ organizations, members }` pair here.
export const allowedParticipationMemberships = [
  {
    organizations: [...AndereCodeList],
    members: [
      ...WelzijnsverenigingCodeList,
      ...AgbCodeList,
      ...AutonomeVerzorgingsinstellingCodeList,
      ...ApbCodeList,
      ...DienstverlenendeVerenigingCodeList,
      ...MunicipalityCodeList,
      ...OCMWCodeList,
      ...OpdrachthoudendeVerenigingCodeList,
      ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
      ...PevaMunicipalityCodeList,
      ...PevaProvinceCodeList,
      ...ProjectverenigingCodeList,
      ...ProvinceCodeList,
      ...ZiekenhuisverenigingCodeList,
    ],
  },
  {
    organizations: [...WelzijnsverenigingCodeList],
    members: [
      ...AutonomeVerzorgingsinstellingCodeList,
      ...DienstverlenendeVerenigingCodeList,
      ...MunicipalityCodeList,
      ...OCMWCodeList,
    ],
  },
  {
    organizations: [...ZiekenhuisverenigingCodeList],
    members: [
      ...AutonomeVerzorgingsinstellingCodeList,
      ...MunicipalityCodeList,
      ...OCMWCodeList,
      ...WelzijnsverenigingCodeList,
    ],
  },
  {
    organizations: [
      ...AutonomeVerzorgingsinstellingCodeList,
      ...PevaMunicipalityCodeList,
      ...VerenigingOfVennootschapVoorSocialeDienstverleningCodeList,
      ...WoonzorgverenigingCodeList,
    ],
    members: [...MunicipalityCodeList, ...OCMWCodeList],
  },
  {
    organizations: [
      ...AgbCodeList,
      ...AssistanceZoneCodeList,
      ...PoliceZoneCodeList,
      ...BosgroepCodeList,
    ],
    members: [...MunicipalityCodeList],
  },
  {
    organizations: [...ApbCodeList, ...PevaProvinceCodeList],
    members: [...ProvinceCodeList],
  },
  {
    organizations: [...DienstverlenendeVerenigingCodeList],
    members: [
      ...AutonomeVerzorgingsinstellingCodeList,
      ...AgbCodeList,
      ...DienstverlenendeVerenigingCodeList,
      ...MunicipalityCodeList,
      ...AssistanceZoneCodeList,
      ...OCMWCodeList,
      ...OpdrachthoudendeVerenigingCodeList,
      ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
      ...PoliceZoneCodeList,
    ],
  },
  {
    organizations: [
      ...OpdrachthoudendeVerenigingCodeList,
      ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
    ],
    members: [
      ...AutonomeVerzorgingsinstellingCodeList,
      ...AgbCodeList,
      ...DienstverlenendeVerenigingCodeList,
      ...MunicipalityCodeList,
      ...AssistanceZoneCodeList,
      ...OCMWCodeList,
      ...OpdrachthoudendeVerenigingCodeList,
      ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
      ...PoliceZoneCodeList,
      ...WelzijnsverenigingCodeList,
    ],
  },
  {
    organizations: [...InterlokaleVerenigingCodeList],
    members: [
      ...AndereCodeList,
      ...AutonomeVerzorgingsinstellingCodeList,
      ...AgbCodeList,
      ...ApbCodeList,
      ...BosgroepCodeList,
      ...DienstverlenendeVerenigingCodeList,
      ...MunicipalityCodeList,
      ...AssistanceZoneCodeList,
      ...OCMWCodeList,
      ...OpdrachthoudendeVerenigingCodeList,
      ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
      ...PevaMunicipalityCodeList,
      ...PevaProvinceCodeList,
      ...PoliceZoneCodeList,
      ...ProjectverenigingCodeList,
      ...ProvinceCodeList,
      ...RegionaalLandschapCodeList,
      ...RegionaalZorgplatformCodeList,
      ...VerenigingOfVennootschapVoorSocialeDienstverleningCodeList,
      ...VervoerregioraadCodeList,
      ...WelzijnsverenigingCodeList,
      ...WoonmaatschappijCodeList,
      ...WoonzorgverenigingCodeList,
      ...ZiekenhuisverenigingCodeList,
      ...ZorgraadCodeList,
    ],
  },
  {
    organizations: [...ProjectverenigingCodeList],
    members: [
      ...MunicipalityCodeList,
      ...AssistanceZoneCodeList,
      ...OCMWCodeList,
      ...PoliceZoneCodeList,
    ],
  },
  {
    organizations: [...RegionaalLandschapCodeList],
    members: [...MunicipalityCodeList, ...ProvinceCodeList],
  },
  {
    organizations: [...RegionaalZorgplatformCodeList],
    members: [...ZorgraadCodeList],
  },
  {
    organizations: [...WoonmaatschappijCodeList],
    members: [...MunicipalityCodeList, ...OCMWCodeList, ...ProvinceCodeList],
  },
];

// Same as above but for founding relationships between organizations.
// ```
// {
//   organizations: [...AgbCodeList],
//   members: [...MunicipalityCodeList],
// }
// ```
// means "an AGB can have as founding organisation a municipality" and "a
// municipality can found an AGB".
export const allowedFoundingMemberships = [
  {
    organizations: [
      ...AgbCodeList,
      ...DistrictCodeList,
      ...DienstverlenendeVerenigingCodeList,
      ...InterlokaleVerenigingCodeList,
      ...OpdrachthoudendeVerenigingCodeList,
      ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
      ...ProjectverenigingCodeList,
      ...PevaMunicipalityCodeList,
    ],
    members: [...MunicipalityCodeList],
  },
  {
    organizations: [
      ...ApbCodeList,
      ...BosgroepCodeList,
      ...PevaProvinceCodeList,
    ],
    members: [...ProvinceCodeList],
  },
  {
    organizations: [
      ...AutonomeVerzorgingsinstellingCodeList,
      ...VerenigingOfVennootschapVoorSocialeDienstverleningCodeList,
      ...WelzijnsverenigingCodeList,
      ...WoonzorgverenigingCodeList,
      ...ZiekenhuisverenigingCodeList,
    ],
    members: [...OCMWCodeList],
  },
];

// Similar as above but for "has a relationship" memberships between
// organizations. Note, from a user standpoint this kind of membership has no
// direction. More concretely, for a user the following would be identical:
// - "A has a relationship with B"; and
// - "B has a relationship with A".
//
// We do enforce a specific direction, i.e. assignment of `organization` and
// `member`, when storing memberships to ensure data consistency. This direction
// is defined by the data structure below. The `getOppositeClassifications`
// function in `utils/membership-rules.js` takes care of presenting the user
// with the right options.
//
// The OP-3929 rules replace this generic role with the specific ones for all
// non-worship organizations. Only the worship classifications keep it.
export const allowedHasRelationWithMemberships = [
  {
    organizations: [...CentralWorshipServiceCodeList],
    members: [...WorshipServiceCodeList, ...RepresentativeBodyCodeList],
  },
  {
    organizations: [...WorshipServiceCodeList],
    members: [...RepresentativeBodyCodeList],
  },
];

// Same as above for "serves" memberships: "a municipality is served by an
// OCMW" and "an OCMW serves a municipality".
export const allowedServingMemberships = [
  {
    organizations: [...MunicipalityCodeList],
    members: [...OCMWCodeList],
  },
];

// Same as above for "grants recognition to" memberships: "an organization was
// recognised by a member organization" and "a member organization grants
// recognition to an organization".
export const allowedRecognitionMemberships = [
  {
    organizations: [...BosgroepCodeList],
    members: [...ProvinceCodeList],
  },
];

// Same as above for "is actually represented in (no membership)" memberships.
export const allowedRepresentationMemberships = [
  {
    organizations: [...RegionaalZorgplatformCodeList],
    members: [
      ...AutonomeVerzorgingsinstellingCodeList,
      ...ZiekenhuisverenigingCodeList,
    ],
  },
  {
    organizations: [...VervoerregioraadCodeList],
    members: [...MunicipalityCodeList],
  },
  {
    organizations: [...WoonmaatschappijCodeList],
    members: [...WoonmaatschappijCodeList],
  },
  {
    organizations: [...ZorgraadCodeList],
    members: [...MunicipalityCodeList, ...OCMWCodeList],
  },
];
// Which related-organization fields the create form shows, per classification
// of the created organization. One entry per field of the OP-3929 rules file:
//
// - `role`/`asMember`: the membership role and the side of the membership the
//   created organization sits on: as member (`asMember` true) or as
//   organization (`asMember` false).
// - `required`/`multiple`: whether the field is mandatory and allows selecting
//   multiple organizations.
// - `minimum`: how many organizations the field must keep, counted at creation
//   and when deleting relations. `classifications` restricts which ones count.
// - `skipCreateForm`: the create form renders this field itself (AGB/APB set
//   their founder through the municipality/province select).
//
// The allowed organizations per field are derived from the tables above, so
// those stay the single source of truth. The founder and recognizer fields of
// the types handled by the autofill task are deliberately absent here.
export const membershipFieldsByClassification = {
  [CLASSIFICATION.MUNICIPALITY.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: true,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
      asMember: true,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.SERVES,
      asMember: false,
      required: true,
      multiple: false,
      minimum: { count: 1 },
    },
  ],
  [CLASSIFICATION.OCMW.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: true,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.SERVES,
      asMember: true,
      required: true,
      multiple: false,
      minimum: { count: 1 },
    },
  ],
  [CLASSIFICATION.DISTRICT.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: false,
      minimum: { count: 1 },
    },
  ],
  [CLASSIFICATION.ANDERE.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.BOSGROEP.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.INTERLOKALE_VERENIGING.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 2 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1, classifications: [...MunicipalityCodeList] },
    },
  ],
  [CLASSIFICATION.REGIONAAL_LANDSCHAP.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.REGIONAAL_ZORGPLATFORM.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
      asMember: false,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.VERVOERREGIORAAD.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.WOONMAATSCHAPPIJ.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
      asMember: false,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.ZORGRAAD.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: true,
      multiple: true,
      minimum: {
        count: 1,
        classifications: [...RegionaalZorgplatformCodeList],
      },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
  ],
  [CLASSIFICATION.AGB.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: false,
      minimum: { count: 1 },
      // The AGB form sets the founder through its municipality select.
      skipCreateForm: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: false,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.APB.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: false,
      minimum: { count: 1 },
      // The APB form sets the founder through its province select.
      skipCreateForm: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: false,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.PROVINCE.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: true,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO,
      asMember: true,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 2, classifications: [...MunicipalityCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 2, classifications: [...MunicipalityCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 2, classifications: [...MunicipalityCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 2, classifications: [...MunicipalityCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 2, classifications: [...MunicipalityCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 2, classifications: [...MunicipalityCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.PROJECTVERENIGING.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 2, classifications: [...MunicipalityCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 2, classifications: [...MunicipalityCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.POLICE_ZONE.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: false,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.ASSISTANCE_ZONE.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.WELZIJNSVERENIGING.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1, classifications: [...OCMWCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1, classifications: [...OCMWCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.ZIEKENHUISVERENIGING.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1, classifications: [...OCMWCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1, classifications: [...OCMWCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1, classifications: [...OCMWCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.PEVA_MUNICIPALITY.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: false,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: true,
      minimum: { count: 1, classifications: [...MunicipalityCodeList] },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
  [CLASSIFICATION.PEVA_PROVINCE.id]: [
    {
      role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      asMember: false,
      required: true,
      multiple: false,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: false,
      required: true,
      multiple: false,
      minimum: { count: 1 },
    },
    {
      role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      asMember: true,
      required: false,
      multiple: true,
    },
  ],
};
