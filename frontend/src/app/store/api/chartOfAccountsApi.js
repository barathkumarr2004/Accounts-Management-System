import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const chartOfAccountsApi = createApi({
  reducerPath: 'chartOfAccountsApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({
    getChartOfAccounts: builder.query({
      query: () => '/chartsofaccounts',
    }),
  }),
});

export const { useGetChartOfAccountsQuery } = chartOfAccountsApi;