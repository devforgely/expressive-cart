const mockFindOneById = jest.fn();
const mockLockById = jest.fn();
const mockFindItems = jest.fn();
const mockClear = jest.fn();
const mockCreate = jest.fn();
const mockFindMatchingPending = jest.fn();
const mockUpdateAddresses = jest.fn();
const mockDiscardUnchargedPending = jest.fn();
const mockSaveChargeId = jest.fn();
const mockMarkPaid = jest.fn();
const mockRemove = jest.fn();
const mockCancel = jest.fn();
const mockFindById = jest.fn();
const mockCreateMany = jest.fn();
const mockPresent = jest.fn();
const mockChargesCreate = jest.fn();
const mockChargesRetrieve = jest.fn();
const mockChargesSearch = jest.fn();
const mockRefundsCreate = jest.fn();

jest.mock('../models/cart', () => ({
  findOneById: mockFindOneById,
  lockById: mockLockById
}));

jest.mock('../models/cartItem', () => ({
  find: mockFindItems,
  clear: mockClear
}));

jest.mock('../models/order', () => {
  const OrderModel = jest.fn().mockImplementation(() => ({
    create: mockCreate
  }));
  OrderModel.findMatchingPending = mockFindMatchingPending;
  OrderModel.updateAddresses = mockUpdateAddresses;
  OrderModel.discardUnchargedPending = mockDiscardUnchargedPending;
  OrderModel.saveChargeId = mockSaveChargeId;
  OrderModel.markPaid = mockMarkPaid;
  OrderModel.remove = mockRemove;
  OrderModel.cancel = mockCancel;
  OrderModel.findById = mockFindById;
  return OrderModel;
});

jest.mock('../models/orderItem', () => ({
  createMany: mockCreateMany
}));

jest.mock('./OrderService', () => {
  return jest.fn().mockImplementation(() => ({
    present: mockPresent
  }));
});

jest.mock('../db', () => ({
  query: jest.fn(),
  resolveDb: (dbClient) => dbClient,
  withTransaction: (work) => work({ query: jest.fn() })
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    charges: {
      create: mockChargesCreate,
      retrieve: mockChargesRetrieve,
      search: mockChargesSearch
    },
    refunds: {
      create: mockRefundsCreate
    }
  }));
});

const OrderModel = require('../models/order');
const CartService = require('./CartService');

const address = {
  fullName: 'Ada Lovelace',
  line1: '1 Analytical Engine',
  city: 'London',
  region: 'Greater London',
  postalCode: 'SW1A 1AA',
  country: 'United Kingdom'
};

function checkoutDetails() {
  return {
    paymentInfo: { id: 'tok_visa' },
    shippingAddress: address,
    billingAddress: address
  };
}

describe('CartService checkout', () => {
  const service = new CartService();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFindOneById.mockResolvedValue({ id: 3, user_id: 1 });
    mockLockById.mockResolvedValue({ id: 3, user_id: 1 });
    mockFindItems.mockResolvedValue([
      { id: 9, product_id: 4, quantity: 2, price: 1000 }
    ]);
    mockFindMatchingPending.mockResolvedValue(null);
    mockUpdateAddresses.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: 10,
      order_number: 'EC23456789',
      user_id: 1,
      total_price: 2599,
      status: 'pending',
      stripe_charge_id: null
    });
    mockCreateMany.mockResolvedValue([]);
    mockDiscardUnchargedPending.mockResolvedValue();
    mockSaveChargeId.mockResolvedValue({ id: 10 });
    mockMarkPaid.mockResolvedValue({
      id: 10,
      order_number: 'EC23456789',
      total_price: 2599,
      status: 'paid'
    });
    mockClear.mockResolvedValue();
    mockRemove.mockResolvedValue();
    mockCancel.mockResolvedValue();
    mockFindById.mockResolvedValue(null);
    mockPresent.mockImplementation(async (order) => ({
      id: order.order_number,
      status: order.status
    }));
    mockChargesCreate.mockResolvedValue({
      id: 'ch_1',
      amount: 2599,
      status: 'succeeded',
      refunded: false,
      payment_method_details: { card: { brand: 'visa', last4: '4242' } }
    });
    mockChargesSearch.mockResolvedValue({ data: [] });
    mockRefundsCreate.mockResolvedValue({ id: 're_1' });
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('saves the order before charging, then marks it paid', async () => {
    const result = await service.checkout(3, 1, checkoutDetails());

    expect(OrderModel).toHaveBeenCalledWith(expect.objectContaining({
      userId: 1,
      total: 2599,
      status: 'pending',
      shippingAddress: address
    }));
    expect(mockChargesCreate).toHaveBeenCalledWith({
      amount: 2599,
      currency: 'usd',
      source: 'tok_visa',
      metadata: { order_number: 'EC23456789' }
    }, {
      idempotencyKey: 'checkout-EC23456789'
    });
    expect(mockCreate.mock.invocationCallOrder[0]).toBeLessThan(mockChargesCreate.mock.invocationCallOrder[0]);
    expect(mockCreateMany.mock.invocationCallOrder[0]).toBeLessThan(mockChargesCreate.mock.invocationCallOrder[0]);
    expect(mockChargesCreate.mock.invocationCallOrder[0]).toBeLessThan(mockMarkPaid.mock.invocationCallOrder[0]);
    expect(mockMarkPaid).toHaveBeenCalledWith(10, {
      last4: '4242',
      brand: 'visa',
      chargeId: 'ch_1'
    }, expect.anything());
    expect(mockClear).toHaveBeenCalledWith(3, expect.anything());
    expect(mockRefundsCreate).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 'EC23456789', status: 'paid' });
  });

  it('does not charge when the order cannot be saved', async () => {
    mockCreate.mockRejectedValue(new Error('insert failed'));

    await expect(service.checkout(3, 1, checkoutDetails())).rejects.toThrow('insert failed');
    expect(mockChargesCreate).not.toHaveBeenCalled();
    expect(mockClear).not.toHaveBeenCalled();
  });

  it('does not charge an empty cart', async () => {
    mockFindItems.mockResolvedValue([]);

    await expect(service.checkout(3, 1, checkoutDetails())).rejects.toMatchObject({ status: 400 });
    expect(mockChargesCreate).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('removes the pending order when the card is declined', async () => {
    mockChargesCreate.mockRejectedValue({
      type: 'StripeCardError',
      code: 'card_declined',
      decline_code: 'generic_decline'
    });

    await expect(service.checkout(3, 1, checkoutDetails())).rejects.toMatchObject({
      status: 402,
      message: 'Your card was declined.'
    });
    expect(mockRemove).toHaveBeenCalledWith(10);
    expect(mockRefundsCreate).not.toHaveBeenCalled();
    expect(mockMarkPaid).not.toHaveBeenCalled();
    expect(mockClear).not.toHaveBeenCalled();
  });

  it('refunds and drops the order when the paid update fails', async () => {
    mockMarkPaid.mockRejectedValue(new Error('db down'));

    await expect(service.checkout(3, 1, checkoutDetails())).rejects.toMatchObject({
      status: 500,
      message: 'Payment was reversed because the order could not be completed. Please try again.'
    });
    expect(mockRefundsCreate).toHaveBeenCalledWith(
      { charge: 'ch_1' },
      { idempotencyKey: 'refund-ch_1' }
    );
    expect(mockRemove).toHaveBeenCalledWith(10);
    expect(mockClear).not.toHaveBeenCalled();
  });

  it('does not refund when the saved order cannot be read', async () => {
    mockMarkPaid.mockRejectedValue(new Error('db down'));
    mockFindById.mockRejectedValue(new Error('db down'));

    await expect(service.checkout(3, 1, checkoutDetails())).rejects.toMatchObject({
      status: 500,
      message: expect.stringContaining('ch_1')
    });
    expect(mockRefundsCreate).not.toHaveBeenCalled();
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('keeps the charge reference when the refund cannot be issued', async () => {
    mockMarkPaid.mockRejectedValue(new Error('db down'));
    mockRefundsCreate.mockRejectedValue(new Error('stripe down'));

    await expect(service.checkout(3, 1, checkoutDetails())).rejects.toMatchObject({
      status: 500,
      message: expect.stringContaining('ch_1')
    });
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('does not refund an order that is already paid', async () => {
    mockMarkPaid.mockRejectedValue(new Error('deadlock'));
    mockFindById.mockResolvedValue({
      id: 10,
      order_number: 'EC23456789',
      status: 'paid'
    });

    const result = await service.checkout(3, 1, checkoutDetails());

    expect(result).toEqual({ id: 'EC23456789', status: 'paid' });
    expect(mockRefundsCreate).not.toHaveBeenCalled();
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('reuses a pending order and does not create a second charge', async () => {
    mockFindMatchingPending.mockResolvedValue({
      id: 10,
      order_number: 'EC23456789',
      total_price: 2599,
      status: 'pending',
      stripe_charge_id: 'ch_existing'
    });
    mockChargesRetrieve.mockResolvedValue({
      id: 'ch_existing',
      amount: 2599,
      status: 'succeeded',
      refunded: false,
      payment_method_details: { card: { brand: 'visa', last4: '4242' } }
    });

    await service.checkout(3, 1, checkoutDetails());

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockChargesCreate).not.toHaveBeenCalled();
    expect(mockChargesRetrieve).toHaveBeenCalledWith('ch_existing');
    expect(mockMarkPaid).toHaveBeenCalledWith(10, expect.objectContaining({
      chargeId: 'ch_existing'
    }), expect.anything());
  });

  it('recovers a charge created under the same idempotency key', async () => {
    mockChargesCreate.mockRejectedValue({ type: 'StripeIdempotencyError' });
    mockChargesSearch.mockResolvedValue({
      data: [{
        id: 'ch_recovered',
        amount: 2599,
        status: 'succeeded',
        refunded: false,
        payment_method_details: { card: { brand: 'visa', last4: '4242' } }
      }]
    });

    await service.checkout(3, 1, checkoutDetails());

    expect(mockRemove).not.toHaveBeenCalled();
    expect(mockMarkPaid).toHaveBeenCalledWith(10, expect.objectContaining({
      chargeId: 'ch_recovered'
    }), expect.anything());
  });

  it('keeps the pending order when a duplicate checkout is still in progress', async () => {
    mockChargesCreate.mockRejectedValue({ type: 'StripeIdempotencyError' });

    await expect(service.checkout(3, 1, checkoutDetails())).rejects.toMatchObject({ status: 409 });
    expect(mockRemove).not.toHaveBeenCalled();
    expect(mockRefundsCreate).not.toHaveBeenCalled();
  });

  it('rejects a cart that belongs to someone else before charging', async () => {
    mockFindOneById.mockResolvedValue({ id: 3, user_id: 9 });

    await expect(service.checkout(3, 1, checkoutDetails())).rejects.toMatchObject({ status: 404 });
    expect(mockChargesCreate).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
