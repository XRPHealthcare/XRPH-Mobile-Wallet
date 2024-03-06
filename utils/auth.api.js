import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {client} from './api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSingup = () => {
  const queryClient = useQueryClient();
  return useMutation(async singupData => {
    const response = await client('auth/signup', {
      method: 'POST',
      data: singupData,
    });

    console.log('-----------singup respnse---------', response);

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
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation(async loginData => {
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
  });
};

export const useUpdateAccount = () => {
  return useMutation(
    async ({payload, id}) => {
      const response = await client(`auth/update/${id}`, {
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

export const useVerifyPassword = () => {
  return useMutation(
    async payload => {
      const response = await client(`auth/verify-password`, {
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

export const useChangePassword = () => {
  return useMutation(
    async payload => {
      const response = await client(`auth/change-password`, {
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

export const useDeleteAccount = () => {
  return useMutation(
    async id => {
      const response = await client(`auth/delete/${id}`, {
        method: 'GET',
      });
      return response;
    },
    {
      onSuccess: () => {},
    },
  );
};

export const useGetLoggedInUser = () => {
  return useMutation(
    async () => {
      const response = await client(`auth/getLoggedInUser`, {
        method: 'GET',
      });
      return response;
    },
    {
      onSuccess: () => {},
    },
  );
};

export const useGetWallet = () => {
  return useMutation(
    async address => {
      const response = await client(
        `auth/getWallet?wallet_address=${address}`,
        {
          method: 'GET',
        },
      );
      return response;
    },
    {
      onSuccess: () => {},
    },
  );
};

export const useGetExchanges = id =>
  useQuery(['getExchanges'], async () => {
    const response = await client(`auth/getExchanges/${id}`);
    return response;
  });

export const useGetRPCs = id =>
  useQuery(['getRpcs'], async () => {
    const response = await client(`auth/getRpcs/${id}`);
    return response;
  });
