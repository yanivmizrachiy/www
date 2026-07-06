// Backwards-compatible shim that wraps the real LTI hook.
// Old screens import this; new code should import useLtiSession directly.

import { useLtiSession } from "./useLtiSession";

export type {
  DomainKey,
  DomainStatus,
  DomainState,
} from "./useLtiSession";

export function useMoodleConnection() {
  const { loading, site, session } = useLtiSession();
  return {
    loading,
    user: null,
    sites: site ? [site] : [],
    activeSite: site,
    session,
    domains: [],
    refresh: () => {},
  };
}
