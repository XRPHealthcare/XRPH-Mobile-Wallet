import AsyncStorage from '@react-native-async-storage/async-storage';

export const switchRPC = async (currentRPC, rpcList) => {
  const triedRPCs = (await AsyncStorage.getItem('triedRPCs')) || '[]';
  const parsedRPCs = JSON.parse(triedRPCs);
  if (parsedRPCs?.length !== rpcList?.length) {
    for (let i = 0; i < rpcList.length; i++) {
      const nextIndex = (rpcList.indexOf(currentRPC) + 1) % rpcList.length;
      const nextRPC = rpcList[nextIndex];
      if (!parsedRPCs?.includes(currentRPC)) {
        await AsyncStorage.setItem(
          'triedRPCs',
          JSON.stringify([...parsedRPCs, currentRPC]),
        );
      }
      return nextRPC;
    }
  } else {
    // All RPCs have been tried
    return Promise.reject('All RPCs have been tried');
  }
};
