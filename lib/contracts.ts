/**
 * lib/contracts.ts
 *
 * AeternumVault contract addresses per chain and the typed ABI import.
 *
 * Every hook in hooks/contracts/ imports from here.
 * When deploying to a new network, add one entry to AETERNUM_VAULT_ADDRESSES.
 *
 * The ABI lives in lib/abi.ts as a typed `as const` object.
 * Keeping addresses and ABI in separate files means updating one
 * never accidentally breaks imports of the other.
 */

import { AETERNUM_VAULT_ABI } from './abi'
import { CHAIN_IDS } from '@/config/chains'

// --- Contract addresses ---
//
// Keys are numeric chain IDs.
// Values are checksummed contract addresses as `0x${string}`.
//
// Sepolia address is read from the environment variable set after deployment.
// This avoids hardcoding an address that changes with every redeploy during
// active Sepolia development.
//
// Mainnet address will be added here before production launch.

export const AETERNUM_VAULT_ADDRESSES: Record<number, `0x${string}`> = {
  [CHAIN_IDS.SEPOLIA]:
    (process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS as `0x${string}`) ??
    '0x0000000000000000000000000000000000000000',
}

// --- Address helper ---
//
// Used by every contract read/write hook to get the correct address
// for the connected chain without repeating the lookup logic.
//
// Returns undefined if the chain is not supported — wagmi hooks
// treat an undefined address as disabled and skip the RPC call.

export function getVaultAddress(
  chainId: number | undefined
): `0x${string}` | undefined {
  if (!chainId) return undefined
  return AETERNUM_VAULT_ADDRESSES[chainId]
}

// --- Typed contract object ---
//
// Combines address lookup + ABI into the shape wagmi's useReadContract
// and useWriteContract expect when spread into a hook call:
//
//   const { data } = useReadContract({
//     ...getVaultContract(chainId),
//     functionName: 'getRecoveryConfig',
//     args: [address],
//   })

export function getVaultContract(chainId: number | undefined) {
  return {
    address: getVaultAddress(chainId),
    abi:     AETERNUM_VAULT_ABI,
  } as const
}

// Re-export ABI so hooks only need to import from contracts.ts
export { AETERNUM_VAULT_ABI }