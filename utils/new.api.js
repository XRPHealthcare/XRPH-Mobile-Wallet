import {useQuery} from '@tanstack/react-query';
import {client} from './api-client';

export const useGetNews = () =>
  useQuery({
    queryKey: ['getNews'],
    queryFn: async () => {
      const response = await client(`auth/getNews`);
      return response;
    },
    staleTime: 1000 * 5,
  });
