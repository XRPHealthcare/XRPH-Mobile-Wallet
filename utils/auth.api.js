import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {client} from './api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSingup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['signup'],
    mutationFn: async singupData => {
      const response = await client('auth/signup', {
        method: 'POST',
        data: singupData,
      });

      if (response.error) {
        throw new Error(response.error);
      }
      if (response?.access_token) {
        AsyncStorage.setItem('token', response.access_token);
        queryClient.invalidateQueries('token');
        return response;
      } else {
        throw new Error('Unexpected response from the server');
      }
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['login'],
    mutationFn: async loginData => {
      const response = await client('auth/login', {
        method: 'POST',
        data: loginData,
      });

      if (response.error) {
        throw new Error(response.error);
      }
      if (response?.access_token) {
        AsyncStorage.setItem('token', response.access_token);
        queryClient.invalidateQueries('token');
        return response;
      } else {
        throw new Error('Unexpected response from the server');
      }
    },
  });
};

export const useUpdateAccount = () => {
  return useMutation({
    mutationKey: ['updateAccount'],
    mutationFn: async ({payload, id}) => {
      const response = await client(`auth/update/${id}`, {
        method: 'POST',
        data: payload,
      });
      return response;
    },
  });
};

export const useVerifyPassword = () => {
  return useMutation({
    mutationKey: ['verifyPassword'],
    mutationFn: async payload => {
      const response = await client('auth/verify-password', {
        method: 'POST',
        data: payload,
      });
      return response;
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationKey: ['changePassword'],
    mutationFn: async payload => {
      const response = await client('auth/change-password', {
        method: 'POST',
        data: payload,
      });
      return response;
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationKey: ['deleteAccount'],
    mutationFn: async id => {
      const response = await client(`auth/delete/${id}`, {
        method: 'GET',
      });
      return response;
    },
  });
};

export const useGetLoggedInUser = () => {
  return useMutation({
    mutationKey: ['getLoggedInUser'],
    mutationFn: async () => {
      const response = await client(`auth/getLoggedInUser`, {
        method: 'GET',
      });
      return response;
    },
  });
};

export const useGetWallet = () => {
  return useMutation({
    mutationKey: ['getWallet'],
    mutationFn: async address => {
      const response = await client(
        `auth/getWallet?wallet_address=${address}`,
        {
          method: 'GET',
        },
      );
      return response;
    },
  });
};

export const useGetExchanges = () => {
  return useQuery({
    queryKey: ['getExchanges'],
    queryFn: async () => {
      const response = await client(`auth/getExchanges`, {
        method: 'GET',
      });
      return response;
    },
  });
};

export const useGetRPCs = id => {
  return useQuery({
    queryKey: ['getRpcs', id],
    queryFn: async () => {
      const response = await client(`auth/getRpcs/${id}`, {
        method: 'GET',
      });
      return response;
    },
    enabled: !!id,
  });
};
