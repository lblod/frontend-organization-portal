{{page-title this.model.governingBodyClassification.label}}

{{breadcrumb
  this.model.governingBodyClassification.label
  route="organizations.organization.governing-bodies.governing-body"
  models=(array this.model.organization.id this.model.governingBody.id)
}}

{{outlet}}