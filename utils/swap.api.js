import {useMutation} from '@tanstack/react-query';
import {client} from './api-client';

export const useAuthenticateQR = () => {
  return useMutation({
    mutationKey: ['authenticateQR'],
    mutationFn: async payload => {
      const response = await client(`swap/authenticateQRCode`, {
        method: 'POST',
        data: payload,
      });
      return response;
    },
  });
};
