import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {client} from './api-client';

export const useGetUserStakes = ({limit, offset, address}) =>
  useQuery({
    queryKey: ['getUserStakes', limit, offset, address],
    queryFn: async () => {
      const response = await client(
        `wallet/getUserStakes/${address}?limit=${limit}&offset=${offset}`,
      );
      return response;
    },
    refetchInterval: 5000,
    enabled: !!address,
  });

export const useGetUserPortfolio = () =>
  useQuery({
    queryKey: ['getUserPortfolio'],
    queryFn: async () => {
      const response = await client(`wallet/getLoggedInUserPortfolio`);
      return response;
    },
    refetchInterval: 30 * 60000,
  });

export const useGetTotalStake = () =>
  useQuery({
    queryKey: ['getTotalStake'],
    queryFn: async () => {
      const response = await client(`wallet/getTotalStake`);
      return response;
    },
    refetchInterval: 5000,
  });

export const useGetUserTotalStakes = address =>
  useQuery({
    queryKey: ['getUserTotalStake', address],
    queryFn: async () => {
      const response = await client(`wallet/getUserTotalStake/${address}`);
      return response;
    },
    refetchInterval: 5000,
    enabled: !!address,
  });

export const useGetUserRewards = address =>
  useQuery({
    queryKey: ['getUserRewards', address],
    queryFn: async () => {
      const response = await client(`wallet/getUserRewards/${address}`);
      return response;
    },
    refetchInterval: 5000,
    enabled: !!address,
  });

export const useGetDailyRewards = address =>
  useQuery({
    queryKey: ['getDailyRewards'],
    queryFn: async () => {
      const response = await client(`wallet/getDailyRewards/${address}`);
      return response;
    },
    refetchInterval: 5000,
    enabled: !!address,
  });

export const useAddTrelloCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['addTrelloCard'],
    mutationFn: async payload => {
      const response = await client(`wallet/addTrelloCard`, {
        method: 'POST',
        data: payload,
      });
      return response;
    },
  });
};

export const useStake = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['stake'],
    mutationFn: async payload => {
      const response = await client(`wallet/stake`, {
        method: 'POST',
        data: payload,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['getUserPortfolio']);
      queryClient.invalidateQueries();
    },
  });
};

export const useWithdrawStake = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['withdrawStake'],
    mutationFn: async payload => {
      const response = await client(`wallet/withdrawStake/${payload?.id}`, {
        method: 'POST',
        data: payload?.secret,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['getUserPortfolio']);
      queryClient.invalidateQueries();
    },
  });
};

export const useGetAddressBook = () =>
  useQuery({
    queryKey: ['getWalletAddresses'],
    queryFn: async () => {
      const response = await client(`wallet/getWalletAddresses`);
      return response;
    },
  });

export const useAddWalletAddressToBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['addWalletAddressToBook'],
    mutationFn: async payload => {
      const response = await client(`wallet/addWalletAddressToBook`, {
        method: 'POST',
        data: payload,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useUpdateWalletAddressToBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateWalletAddressToBook'],
    mutationFn: async payload => {
      const response = await client(`wallet/updateWalletAddressById`, {
        method: 'POST',
        data: payload,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useDeleteWalletAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteWalletAddress'],
    mutationFn: async address => {
      console.log("calling api for delete address book",address);
      const response = await client(
        `wallet/deleteWalletAddressById?walletAddressId=${address}`,
        {
          data:{},
          method: 'POST',
        },
      ).catch((err)=>{
        console.log("error in api",err)
      });
      console.log("called api for delete address book",response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError:(err)=>{
      console.log("err",err)
    }
  });
};

export const useGetPrices = () => {
  return useMutation({
    mutationKey: ['getPrices'],
    mutationFn: async () => {
      const response = await client(`swap/getPrices`, {
        method: 'GET',
      });
      return response;
    },
  });
};
