/**
 * graphql/queries.ts
 *
 * Centralizes data requests for vault states, transaction history,
 * and automated recovery lifecycles.
 */

export const GET_ALL_VAULTS = `
  query GetAllVaults {
    vaultsItems: vaultss(orderBy: "createdAtBlock", orderDirection: "desc") {
      items {
        id
        backupAddress
        inactivityPeriod
        lastActivityTimestamp
        isRecovered
        isAbandoned
        createdAtBlock
      }
    }
  }
`;

export const GET_USER_VAULT = `
  query GetUserVault($id: String!) {
    vault: vaults(id: $id) {
      id
      backupAddress
      inactivityPeriod
      lastActivityTimestamp
      isRecovered
      isAbandoned
      createdAtBlock
    }
  }
`;

export const GET_VAULT_TRANSACTIONS = `
  query GetVaultTransactions($vaultId: String!, $limit: Int, $after: String) {
    vaultTransactionsItems: vaultTransactionss(
      where: { wallet: $vaultId }, 
      orderBy: "timestamp", 
      orderDirection: "desc",
      limit: $limit,
      after: $after
    ) {
      items {
        id
        vaultId: wallet
        type
        amount
        timestamp
        transactionHash
        blockNumber
        toAddress
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_VAULT_BALANCE_EVENTS = `
  query GetVaultBalanceEvents($vaultId: String!) {
    balanceEvents: balanceEventss(
      where: { vaultId: $vaultId },
      orderBy: "blockTimestamp",
      orderDirection: "asc",
      limit: 1000
    ) {
      items {
        eventName
        blockNumber
        logIndex
        blockTimestamp
        amount
      }
    }
  }
`;