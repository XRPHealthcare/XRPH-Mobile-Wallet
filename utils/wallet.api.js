import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {client} from './api-client';

export const useGetUserStakes = ({limit, offset, address}) =>
  useQuery(
    ['getUserStakes', limit, offset, address],
    async () => {
      const response = await client(
        `wallet/getUserStakes/${address}?limit=${limit}&offset=${offset}`,
      );
      return response;
    },
    {refetchInterval: 5000},
  );

export const useGetTotalStake = () =>
  useQuery(
    ['getTotalStake'],
    async () => {
      const response = await client(`wallet/getTotalStake`);
      return response;
    },
    {refetchInterval: 5000},
  );

export const useGetUserTotalStakes = address =>
  useQuery(
    ['getUserTotalStake'],
    async () => {
      try {
        const response = await client(`wallet/getUserTotalStake/${address}`);
        return response;
      } catch (e) {
        return null;
      }
    },
    {refetchInterval: 5000},
  );

export const useGetUserRewards = address =>
  useQuery(
    ['getUserRewards'],
    async () => {
      const response = await client(`wallet/getUserRewards/${address}`);
      return response;
    },
    {refetchInterval: 5000},
  );

export const useGetDailyRewards = address =>
  useQuery(
    ['getDailyRewards'],
    async () => {
      const response = await client(`wallet/getDailyRewards/${address}`);
      return response;
    },
    {refetchInterval: 5000},
  );

export const useAddTrelloCard = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async payload => {
      const response = await client(`wallet/addTrelloCard`, {
        method: 'POST',
        data: payload,
      });
      return response;
    },
    {
      onSuccess: () => {},
    },
  );
};

export const useStake = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async payload => {
      const response = await client(`wallet/stake`, {
        method: 'POST',
        data: payload,
      });
      return response;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    },
  );
};

export const useWithdrawStake = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async payload => {
      const response = await client(`wallet/withdrawStake/${payload?.id}`, {
        method: 'POST',
        data: payload?.secret,
      });
      return response;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    },
  );
};
