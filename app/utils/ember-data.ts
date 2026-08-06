import { registerWarnHandler } from '@ember/debug';
import type { HandlerCallback } from '@ember/debug/lib/handlers';
import type { WarnOptions } from '@ember/debug/lib/warn';

export function silenceEmptySyncRelationshipWarnings() {
  // EmberData displays a warning when we push records with sync relationships where the API only provides a link and no data
  // Due to legacy reasons EmberData makes the assumption that the relationship is empty, even though it's valid according to the {json:api} spec.
  // Since the warning is verbose we silence it but it does require some extra workarounds sometimes (reload instead of load for example).
  // More info: https://github.com/emberjs/data/issues/7584
  const handler: HandlerCallback<WarnOptions> = (
    message: string,
    options: WarnOptions | undefined,
    next: (message: string, options?: WarnOptions) => void,
  ) => {
    if (options?.id === 'ds.store.push-link-for-sync-relationship') {
      return;
    }

    next(message, options);
  };

  registerWarnHandler(handler);
}
