import type { Handler, NextFn } from '@warp-drive/core/request';
import {
  singularize,
  pluralize,
  camelize,
  dasherize,
} from '@warp-drive/utilities/string';

export const ResourcesCompatHandler: Handler = {
  async request(context: any, next: NextFn) {
    // mu-cl-resources uses dasherized member names and dasherized + plural types
    // To make it compatible with non-legacy requests we need to camelize the member names and singularize the type.
    // Once mu-cl-resources uses camelCase for members (and types) we would only need to dasherize + singularize the type if we don't want any other changes in the frontend,
    // But that can be done as a separate handler. Once the frontend then changes the schema definitions to use camelized + plural, that handler wouldn't be needed either.
    // The only remaining thing would then be a handler for the pagination meta (assuming mu-cl-resources won't provide it)

    // TODO: pluralize the type before sending to the server, could also be done in a builder, but this seems simpler?

    const response = await next(context.request);
    const document = response.content;

    if (document && typeof document === 'object') {
      if (Array.isArray(document.data)) {
        document.data.forEach(normalizeResource);
      } else if (document.data) {
        normalizeResource(document.data);
      }

      if (Array.isArray(document.included)) {
        document.included.forEach(normalizeResource);
      }
    }

    return response;
  },
};

// Normalizes the backend JSON payload back to camelCase
function normalizeResource(resource: any) {
  if (!resource || typeof resource !== 'object') return;

  if (typeof resource.type === 'string') {
    resource.type = singularize(resource.type);
  }

  if (resource.attributes && typeof resource.attributes === 'object') {
    const newAttributes: Record<string, any> = {};
    for (const key of Object.keys(resource.attributes)) {
      newAttributes[camelize(key)] = resource.attributes[key];
    }
    resource.attributes = newAttributes;
  }

  if (resource.relationships && typeof resource.relationships === 'object') {
    const newRelationships: Record<string, any> = {};
    for (const key of Object.keys(resource.relationships)) {
      const rel = resource.relationships[key];

      if (rel && rel.data) {
        if (Array.isArray(rel.data)) {
          rel.data.forEach((link: any) => {
            if (link && typeof link.type === 'string')
              link.type = singularize(link.type);
          });
        } else if (typeof rel.data.type === 'string') {
          rel.data.type = singularize(rel.data.type);
        }
      }
      newRelationships[camelize(key)] = rel;
    }
    resource.relationships = newRelationships;
  }
}
