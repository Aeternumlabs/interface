/**
 * hooks/useMounted.ts
 *
 * Returns false on the server and on the first client render, then true
 * after hydration. Use to defer wallet-dependent UI so SSR HTML matches
 * the initial client paint (avoids wagmi / TanStack Query hydration mismatches).
 */

import { useSyncExternalStore } from 'react'

// A no-op subscribe function because the "mounted" status of a client 
// environment never changes back to unmounted during the session life.
const subscribe = () => () => {}

export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,  // Client value (runs after hydration)
    () => false  // Server/Hydration snapshot value
  )
}