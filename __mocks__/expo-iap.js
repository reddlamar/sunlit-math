const useIAP = jest.fn(() => ({
  connected: false,
  products: [],
  subscriptions: [],
  availablePurchases: [],
  activeSubscriptions: [],
  finishTransaction: jest.fn().mockResolvedValue(undefined),
  getAvailablePurchases: jest.fn().mockResolvedValue(undefined),
  fetchProducts: jest.fn().mockResolvedValue(undefined),
  requestPurchase: jest.fn().mockResolvedValue(undefined),
  restorePurchases: jest.fn().mockResolvedValue(undefined),
}));

const getAppTransactionIOS = jest.fn().mockResolvedValue(null);

module.exports = { useIAP, getAppTransactionIOS };
