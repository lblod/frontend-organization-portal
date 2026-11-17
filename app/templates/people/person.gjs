{{page-title this.model.givenName " " this.model.familyName}}
{{breadcrumb
  this.model.givenName
  " "
  this.model.familyName
  route="people.person"
  model=this.model.id
}}

<SidebarContainer>
  <:sidebar>
    <div class="au-d-component-block au-c-sidebar">
      <ul class="au-c-list-navigation">
        <li class="au-c-list-navigation__item">
          <AuNavigationLink @route="people.person.personal-information">
            Contactgegevens
          </AuNavigationLink>
        </li>
        <li class="au-c-list-navigation__item">
          <AuNavigationLink @route="people.person.positions">
            Posities
          </AuNavigationLink>
        </li>
      </ul>
    </div>
  </:sidebar>
  <:content>
    {{outlet}}
  </:content>
</SidebarContainer>