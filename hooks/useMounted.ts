/**
 * hooks/useMounted.ts
 *
 * Returns false on the server and on the first client render, then true
 * after hydration. Use to defer wallet-dependent UI so SSR HTML matches
 * the initial client paint (avoids wagmi / TanStack Query hydration mismatches).
 */

import { useEffect, useState } from 'react'

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
