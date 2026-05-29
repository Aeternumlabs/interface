/**
 * graphql/queries.ts
 *
 * Centralizes data requests for vault states, transaction history,
 * and automated recovery lifecycles.
 */

export const GET_ALL_VAULTS = `
  query GetAllVaults {
    vaultsItems(orderBy: "createdAtBlock", orderDirection: "desc") {
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
    vault(id: $id) {
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
  query GetVaultTransactions($vaultId: String!) {
    vaultTransactionsItems(
      where: { vaultId: $vaultId }, 
      orderBy: "timestamp", 
      orderDirection: "desc"
    ) {
      items {
        id
        vaultId
        type
        amount
        timestamp
        transactionHash
      }
    }
  }
`;