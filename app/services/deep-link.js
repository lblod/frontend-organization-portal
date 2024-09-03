import { getOwner } from '@ember/application';
import Service, { inject as service } from '@ember/service';

// TODO: find a better way to store / configure the handlers map
const REDIRECT_HANDLER = {
  'http://www.w3.org/ns/person#Person': 'person',
  'http://www.w3.org/ns/org#Organization': 'organization',
};

export default class DeepLinkService extends Service {
  @service uriInfo;

  REDIRECT_HANDLER = REDIRECT_HANDLER;

  async redirect(resourceUri) {
    let uriInfo = await this.uriInfo.getDirectLinks(resourceUri);
    let rdfTypes = getRdfTypes(uriInfo);
    let uuid = getUuid(uriInfo);

    if (rdfTypes.length > 0 && uuid) {
      this._handleRedirect(rdfTypes, uuid, resourceUri);
    } else {
      throw new ResourceNotFoundError(
        `No data found for ${resourceUri}`,
        resourceUri,
      );
    }
  }

  async _handleRedirect(types, uuid, resourceUri) {
    let redirectHandler;

    for (let type of types) {
      if (redirectHandler) break;

      let handlerName = this.REDIRECT_HANDLER[type];

      redirectHandler = getOwner(this).lookup(
        `redirect-handler:${handlerName}`,
      );
    }

    if (redirectHandler) {
      await redirectHandler.redirect(uuid, resourceUri);
    } else {
      throw new RedirectHandlerNotFoundError(
        `No redirect handler registered for "${types.join('", "')}"`,
        {
          types,
          uuid,
          resourceUri,
        },
      );
    }
  }
}

function getRdfTypes(uriInfo) {
  const RDF_TYPE_URL = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

  let triples = uriInfo.triples.filter(
    ({ predicate }) => predicate === RDF_TYPE_URL,
  );

  return triples.map((triple) => triple.object.value);
}

function getUuid(uriInfo) {
  const MU_UUID_URL = 'http://mu.semte.ch/vocabularies/core/uuid';
  let triple = uriInfo.triples.find(
    ({ predicate }) => predicate === MU_UUID_URL,
  );

  return triple?.object?.value;
}

class ResourceNotFoundError extends Error {
  constructor(errorMessage, resourceUri) {
    super(errorMessage);
    this.resourceUri = resourceUri;
  }
}

class RedirectHandlerNotFoundError extends Error {
  constructor(errorMessage, { type, uuid, resourceUri }) {
    super(errorMessage);
    this.type = type;
    this.uuid = uuid;
    this.resourceUri = resourceUri;
  }
}
