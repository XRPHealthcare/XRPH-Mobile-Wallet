import {create} from 'zustand';
import {createNewPadlock} from '../handlers/create_new_padlock.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create((set, get) => ({
  // main state variables: part 1 (initial set up)
  // padlock --> generate with function then set to state var, eventually get from localStorage
  // when user enters combination, check their object with padlock
  // if error --> stay on page and display error message
  // if success --> generate a new wallet for the user --> prompt user to name their account --> direct to home screen and display account in dropdown
  padlock: createNewPadlock(),
  setNewPadlock: () =>
    set(() => ({
      padlock: createNewPadlock(),
    })),

  entropy: '',
  setEntropy: newEntropy =>
    set(() => ({
      entropy: newEntropy,
    })),

  padlockErrorMessage: '',
  setPadlockErrorMessage: errorMessage =>
    set(() => ({
      padlockErrorMessage: errorMessage,
    })),
  onPadlockSuccess: () =>
    set(() => ({
      padlockErrorMessage: '',
    })),
  onPadlockError: () =>
    set(() => ({
      padlockErrorMessage: 'Error: Incorrect passcode combination.',
    })),

  accounts: [],
  setAccounts: updatedAccounts => {
    set(() => ({
      accounts: updatedAccounts,
    }));
  },
  addAccount: newAccount =>
    set(() => ({
      accounts: [...accounts, newAccount],
    })),
  activeAccount: {},
  setActiveAccount: account => {
    set(() => ({
      activeAccount: account,
    }));
  },
  sendTransactionDetails: {},
  setSendTransactionDetails: transaction =>
    set(() => ({
      sendTransactionDetails: transaction,
    })),

  destinationAddress: '',
  setDestinationAddress: address =>
    set(() => ({
      destinationAddress: address,
    })),

  token: {},
  setToken: selectedToken =>
    set(() => ({
      token: selectedToken,
    })),

  tokenRate: 0,
  setTokenRate: newRate =>
    set(() => ({
      tokenRate: newRate,
    })),

  amount: '',
  setAmount: newAmount =>
    set(() => ({
      amount: newAmount,
    })),

  memo: '',
  setMemo: newMemo =>
    set(() => ({
      memo: newMemo,
    })),

  destinationTag: '',
  setDestinationTag: newTag =>
    set(() => ({
      destinationTag: newTag,
    })),

  rateLoading: false,
  setRateLoading: bool =>
    set(() => ({
      rateLoading: bool,
    })),

  exchangeTo: 'USD',
  setExchangeTo: to =>
    set(() => ({
      exchangeTo: to,
    })),

  exchangeRate: 0,
  setExchangeRate: rate =>
    set(() => ({
      exchangeRate: rate,
    })),

  fromInput: '',
  setFromInput: input =>
    set(() => ({
      fromInput: input,
    })),

  toInput: '',
  setToInput: input =>
    set(() => ({
      toInput: input,
    })),

  pin: '',
  setPin: newPin =>
    set(() => ({
      pin: newPin,
    })),

  theme: 'light',
  toggleTheme: mode =>
    set(() => ({
      theme: mode,
    })),

  loginWalletAddress: '',
  setLoginWalletAddress: address =>
    set(() => ({
      loginWalletAddress: address,
    })),

  totalBalanceCurrency: 'USD',
  setTotalBalanceCurrency: newCurrency =>
    set(() => ({
      totalBalanceCurrency: newCurrency,
    })),

  accountBalances: [],
  setAccountBalances: newBalances =>
    set(() => ({
      accountBalances: newBalances,
    })),

  node: 'wss://s2.ripple.com/',
  // node: 'wss://testnet.xrpl-labs.com/',
  setNode: newNode =>
    set(() => ({
      node: newNode,
    })),
  isBiometricEnabled: false,
  setIsBiometricEnabled: isEnabled =>
    set(() => ({
      isBiometricEnabled: isEnabled,
    })),
  dynamicLink: '',
  setDynamicLink: url =>
    set(() => ({
      dynamicLink: url,
    })),
  appInfo: null,
  setAppInfo: info =>
    set(() => ({
      appInfo: info,
    })),
  // Optional configuration
  hepticOptions: {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: true,
  },
}));

export default useStore;
