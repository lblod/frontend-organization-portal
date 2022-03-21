







## 1.6.4-1 (2022-03-14)

#### :bug: Bug Fix
* Fix contact gegevens title not shown (#271) 


## 1.6.4-0 (2022-03-10)
#### :bug: Bug Fix
* split first name / last name in filter search person (#270) 
* Remove additional scope parameters
* Remove werkingsgebieden from the app
* fix position details not shown (#268) 


## 1.6.3 (2022-03-03)
# Drone file fix


## 1.6.2 (2022-03-03)
# Fix drone build


## 1.6.1 (2022-03-02)

#### :rocket: Enhancement
* [#261](https://github.com/lblod/frontend-organization-portal/pull/261) perf bestuur ([@nbittich](https://github.com/nbittich))
* [#259](https://github.com/lblod/frontend-organization-portal/pull/259) Allow users to edit contact information on the person edit page ([@nbittich](https://github.com/nbittich))
* [#258](https://github.com/lblod/frontend-organization-portal/pull/258) Update to the newest appuniversum styles ([@nbittich](https://github.com/nbittich))
* [#256](https://github.com/lblod/frontend-organization-portal/pull/256) Show minister position information on the positions page of a person ([@nbittich](https://github.com/nbittich))
* [#255](https://github.com/lblod/frontend-organization-portal/pull/255) Move the position contact information to the person details page ([@nbittich](https://github.com/nbittich))
* [#254](https://github.com/lblod/frontend-organization-portal/pull/254) People search page improvements ([@nbittich](https://github.com/nbittich))
* [#250](https://github.com/lblod/frontend-organization-portal/pull/250) Add support for primary and secondary contact information ([@Windvis](https://github.com/Windvis))

#### Committers: 2
- Nordine Bittich ([@nbittich](https://github.com/nbittich))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))

## 1.6.0 (2022-02-10)

#### :bug: Bug Fix
*  Cancel flow on creating new 'Vestiging' gives error 


## 1.5.4 (2022-02-10)

#### :rocket: Enhancement
* [#250](https://github.com/lblod/frontend-organization-portal/pull/250) Add support for primary and secondary contact information ([@Windvis](https://github.com/Windvis))

#### Committers: 2
- Nordine Bittich ([@nbittich](https://github.com/nbittich))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))

## 1.5.3 (2022-02-01)

#### :bug: Bug Fix
* [#251](https://github.com/lblod/frontend-organization-portal/pull/251) Fix the SPARQL page ([@Windvis](https://github.com/Windvis))

#### Committers: 1
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))


## 1.5.2 (2022-01-26)

#### :bug: Bug Fix
* [#249](https://github.com/lblod/frontend-organization-portal/pull/249) Fix a problem were saving didn't work in some cases on the local involvements page ([@Windvis](https://github.com/Windvis))

#### Committers: 1
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))


## 1.5.1 (2022-01-24)

#### :rocket: Enhancement
* [#248](https://github.com/lblod/frontend-organization-portal/pull/248) Improve the original organizations selection logic on the change events creation page ([@Windvis](https://github.com/Windvis))

#### :bug: Bug Fix
* [#247](https://github.com/lblod/frontend-organization-portal/pull/247) Fix sub organizations select ([@nbittich](https://github.com/nbittich))
* [#246](https://github.com/lblod/frontend-organization-portal/pull/246) Use the proper casing for "OrganisatiePortaal" ([@Windvis](https://github.com/Windvis))

#### :house: Internal
* [#244](https://github.com/lblod/frontend-organization-portal/pull/244) Update to the latest madnificent/ember image ([@Windvis](https://github.com/Windvis))

#### Committers: 2
- Nordine Bittich ([@nbittich](https://github.com/nbittich))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))


## 1.5.0 (2022-01-13)

#### :rocket: Enhancement
* [#240](https://github.com/lblod/frontend-organization-portal/pull/240) Change events management ([@Windvis](https://github.com/Windvis))
* [#231](https://github.com/lblod/frontend-organization-portal/pull/231) Move the form buttons to the top of the page ([@nbittich](https://github.com/nbittich))
* [#230](https://github.com/lblod/frontend-organization-portal/pull/230) Validate that a KBO number is 10 digits long before saving ([@nbittich](https://github.com/nbittich))

#### :bug: Bug Fix
* [#236](https://github.com/lblod/frontend-organization-portal/pull/236) Ensure that timezones are ignored when saving dates selected with the datepicker ([@Windvis](https://github.com/Windvis))

#### Committers: 2
- Nordine Bittich ([@nbittich](https://github.com/nbittich))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))


## 1.4.0 (2021-12-14)

#### :rocket: Enhancement
* [#229](https://github.com/lblod/frontend-organization-portal/pull/229) Allow users to easily report wrong data ([@nbittich](https://github.com/nbittich))
* [#228](https://github.com/lblod/frontend-organization-portal/pull/228) Only show the edit buttons if the user has the required permissions ([@nbittich](https://github.com/nbittich))
* [#223](https://github.com/lblod/frontend-organization-portal/pull/223) Also show the province field when using CRAB on the positions pages ([@nbittich](https://github.com/nbittich))

#### :bug: Bug Fix
* [#227](https://github.com/lblod/frontend-organization-portal/pull/227) Fix a problem where the position name wasn't shown on the edit page ([@Windvis](https://github.com/Windvis))
* [#225](https://github.com/lblod/frontend-organization-portal/pull/225) Show all related organisations of a central worship service ([@nbittich](https://github.com/nbittich))
* [#224](https://github.com/lblod/frontend-organization-portal/pull/224) Fix "Mail ons" link in the address search functionality ([@Windvis](https://github.com/Windvis))

#### Committers: 2
- Nordine Bittich ([@nbittich](https://github.com/nbittich))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))


## 1.3.0 (2021-11-26)

#### :rocket: Enhancement
* [#212](https://github.com/lblod/frontend-organization-portal/pull/212) Use the privacy service to store sensitive personal information ([@Windvis](https://github.com/Windvis))

#### :bug: Bug Fix
* [#218](https://github.com/lblod/frontend-organization-portal/pull/218) Province is a required field on some pages ([@nbittich](https://github.com/nbittich))

#### Committers: 2
- Nordine Bittich ([@nbittich](https://github.com/nbittich))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))


## 1.2.1 (2021-11-24)

#### :bug: Bug Fix
* [#214](https://github.com/lblod/frontend-organization-portal/pull/214) Fix a problem which prevents users from entering the core data edit page ([@Windvis](https://github.com/Windvis))

#### Committers: 1
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))


## v1.2.0 (2021-11-18)

#### :rocket: Enhancement
* [#194](https://github.com/lblod/frontend-organization-portal/pull/194) Add validations to the position creation and edit pages ([@gcapurso](https://github.com/gcapurso))
* [#204](https://github.com/lblod/frontend-organization-portal/pull/204) Convert the SharePoint ids into links ([@Windvis](https://github.com/Windvis))
* [#200](https://github.com/lblod/frontend-organization-portal/pull/200) Integrate CRAB ([@nbittich](https://github.com/nbittich))
* [#201](https://github.com/lblod/frontend-organization-portal/pull/201) Add a page where users can run SPARQL queries ([@nbittich](https://github.com/nbittich))
* [#187](https://github.com/lblod/frontend-organization-portal/pull/187) Add support for deep linking to resources from external applications ([@Windvis](https://github.com/Windvis))
* [#199](https://github.com/lblod/frontend-organization-portal/pull/199) Automatically create a governing body on administrative unit creation ([@Windvis](https://github.com/Windvis))
* [#197](https://github.com/lblod/frontend-organization-portal/pull/197) Validate if a KBO number is unique before saving  ([@Windvis](https://github.com/Windvis))
* [#192](https://github.com/lblod/frontend-organization-portal/pull/192) Add validations to the administrative unit creation and edit page ([@Windvis](https://github.com/Windvis))
* [#188](https://github.com/lblod/frontend-organization-portal/pull/188) Add loading animations ([@Windvis](https://github.com/Windvis))
* [#184](https://github.com/lblod/frontend-organization-portal/pull/184) Add validations to the site creation and edit pages ([@gcapurso](https://github.com/gcapurso))

#### Committers: 3
- Nordine Bittich ([@nbittich](https://github.com/nbittich))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))
- [@gcapurso](https://github.com/gcapurso)


## v1.1.0 (2021-10-04)

#### :rocket: Enhancement
* [#178](https://github.com/lblod/frontend-organization-portal/pull/178) Add validations to the local involvements edit page ([@Windvis](https://github.com/Windvis))
* [#171](https://github.com/lblod/frontend-organization-portal/pull/171) Show the environment name in the top bar ([@Dietr](https://github.com/Dietr))
* [#169](https://github.com/lblod/frontend-organization-portal/pull/169) Add validations to the person creation and edit pages ([@Windvis](https://github.com/Windvis))
* [#167](https://github.com/lblod/frontend-organization-portal/pull/167) Make it possible to change the half election type of a mandate ([@Windvis](https://github.com/Windvis))
* [#166](https://github.com/lblod/frontend-organization-portal/pull/166) Allow deletion of new, unsaved local involvements ([@Windvis](https://github.com/Windvis))
* [#163](https://github.com/lblod/frontend-organization-portal/pull/163) Data loading improvements ([@Windvis](https://github.com/Windvis))
* [#162](https://github.com/lblod/frontend-organization-portal/pull/162) Accessibility audit, fixes and accessibility statement update ([@Dietr](https://github.com/Dietr))
* [#159](https://github.com/lblod/frontend-organization-portal/pull/159) Add basic validations to the position creation and edit pages ([@Windvis](https://github.com/Windvis))
* [#161](https://github.com/lblod/frontend-organization-portal/pull/161) Reset the financing percentage when selecting a non-financing involvement type ([@Windvis](https://github.com/Windvis))
* [#152](https://github.com/lblod/frontend-organization-portal/pull/152) Add the minister edit page ([@gcapurso](https://github.com/gcapurso))
* [#156](https://github.com/lblod/frontend-organization-portal/pull/156) Support selecting multiple nationalities when creating a person ([@Windvis](https://github.com/Windvis))
* [#154](https://github.com/lblod/frontend-organization-portal/pull/154) Add consistent button labels ([@Dietr](https://github.com/Dietr))
* [#153](https://github.com/lblod/frontend-organization-portal/pull/153) Allow the editing of related worship services ([@anitacaron](https://github.com/anitacaron))
* [#151](https://github.com/lblod/frontend-organization-portal/pull/151) Local involvements edit page improvements ([@Windvis](https://github.com/Windvis))

#### :bug: Bug Fix
* [#165](https://github.com/lblod/frontend-organization-portal/pull/165) Improve the 'current position' checkbox behavior ([@gcapurso](https://github.com/gcapurso))
* [#164](https://github.com/lblod/frontend-organization-portal/pull/164) Link all selects to a label ([@Windvis](https://github.com/Windvis))
* [#161](https://github.com/lblod/frontend-organization-portal/pull/161) Reset the financing percentage when selecting a non-financing involvement type ([@Windvis](https://github.com/Windvis))
* [#157](https://github.com/lblod/frontend-organization-portal/pull/157) Contact card consistency + small bugfixes ([@Dietr](https://github.com/Dietr))
* [#150](https://github.com/lblod/frontend-organization-portal/pull/150) Show the correct related organization selects based on the administrative unit type ([@anitacaron](https://github.com/anitacaron))

#### Committers: 4
- Anita Caron ([@anitacaron](https://github.com/anitacaron))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))
- [@gcapurso](https://github.com/gcapurso)
