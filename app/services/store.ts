import { useLegacyStore } from '@warp-drive/legacy';
import { JSONAPICache } from '@warp-drive/json-api';
import { ResourcesCompatHandler } from 'frontend-organization-portal/warp-drive/handlers/resource-compat';

const Store = useLegacyStore({
  legacyRequests: true,
  linksMode: false,
  cache: JSONAPICache,
  handlers: [
    // -- your handlers here
    ResourcesCompatHandler
  ],
  schemas: [
    // -- your schemas here
  ],
});

type Store = InstanceType<typeof Store>;

export default Store;
