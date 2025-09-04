import AsyncStorage from '@react-native-async-storage/async-storage';
import {QueryCache} from '@tanstack/react-query';

const apiURL = 'YOUR_API_URL';

const queryCache = new QueryCache({
  onError: error => {
    console.log(error);
  },
  onSuccess: data => {
    console.log(data);
  },
});

async function client(
  endpoint,
  {data, headers: customHeaders, ...customConfig} = {},
) {
  const token = await AsyncStorage.getItem('token');
  const workerKey = await AsyncStorage.getItem('worker_key');
  const config = {
    method: data ? 'POST' : 'GET',
    body: data instanceof FormData ? data : JSON.stringify(data),
    headers: {
      Authorization: token ? `${token}` : '',
      ...(!data || data instanceof FormData
        ? {}
        : {'Content-Type': 'application/json'}),
      apiKey: workerKey || '',
      ...customHeaders,
    },
    ...customConfig,
  };

  return await window
    .fetch(`${apiURL}/${endpoint}`, config)
    .then(async response => {
      if (response.status === 401) {
        queryCache.clear();
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Unauthorized');
        return Promise.reject(error);
      }
      if (response.ok) {
        const jsonData = await response.json();
        return jsonData;
      } else {
        const jsonData = await response.json();
        return Promise.reject(jsonData);
      }
    });
}

export {client};
