import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode, SandboxPublicTokenCreateRequest } from "plaid";
import { env } from "../config/env";

const configuration = new Configuration({
  basePath: PlaidEnvironments[env.PLAID_ENV],
  baseOptions: { headers: { "PLAID-CLIENT-ID": env.PLAID_CLIENT_ID, "PLAID-SECRET": env.PLAID_SECRET } },
});
const plaidClient = new PlaidApi(configuration);

function sleep(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }

export async function createLinkToken(userId: string) {
  const response = await plaidClient.linkTokenCreate({ user: { client_user_id: userId }, client_name: "Hackathon App", products: [Products.Transactions], country_codes: [CountryCode.Us], language: "en" });
  return response.data;
}

export async function exchangePublicToken(publicToken: string) {
  const response = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
  return response.data;
}

export async function getAccounts(accessToken: string) {
  const response = await plaidClient.accountsGet({ access_token: accessToken });
  return response.data.accounts;
}

export async function getAccountBalances(accessToken: string) {
  const response = await plaidClient.accountsBalanceGet({ access_token: accessToken });
  return response.data.accounts;
}

export async function getTransactions(accessToken: string, startDate: string, endDate: string) {
  async function fetchTransactionPage(offset: number, retriesRemaining = 8): Promise<any> {
    try {
      const response = await plaidClient.transactionsGet({ access_token: accessToken, start_date: startDate, end_date: endDate, options: { count: 100, offset } });
      return response.data;
    } catch (err: any) {
      if (err?.response?.data?.error_code === "PRODUCT_NOT_READY" && retriesRemaining > 0) { await sleep(1000); return fetchTransactionPage(offset, retriesRemaining - 1); }
      throw err;
    }
  }
  let allTransactions: any[] = [];
  let totalTransactions = 0;
  let offset = 0;
  do {
    const response = await fetchTransactionPage(offset);
    allTransactions = allTransactions.concat(response.transactions);
    totalTransactions = response.total_transactions;
    offset = allTransactions.length;
  } while (allTransactions.length < totalTransactions);
  return { accounts: (await fetchTransactionPage(0)).accounts, transactions: allTransactions };
}

export async function getItem(accessToken: string) {
  const response = await plaidClient.itemGet({ access_token: accessToken });
  return response.data.item;
}

export async function getInstitutionName(institutionId: string): Promise<string> {
  try {
    const response = await plaidClient.institutionsGetById({ institution_id: institutionId, country_codes: [CountryCode.Us] });
    return response.data.institution.name;
  } catch { return "Unknown Institution"; }
}

export async function createSandboxPublicToken(institutionId: string, initialProducts: Products[] = [Products.Transactions], seed?: string) {
  const request: SandboxPublicTokenCreateRequest = {
    institution_id: institutionId, initial_products: initialProducts,
    options: seed ? { override_username: "user_custom", override_password: JSON.stringify({ seed }), transactions: { days_requested: 90 } } : undefined,
  };
  const response = await plaidClient.sandboxPublicTokenCreate(request);
  return response.data;
}
