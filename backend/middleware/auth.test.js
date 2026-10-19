const { requireAuth, requireSelf } = require('./auth');

function mockRes() {
  return {};
}

describe('requireAuth', () => {
  it('calls next with 401 when the request is unauthenticated', () => {
    const req = { isAuthenticated: () => false };
    const next = jest.fn();

    requireAuth(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].status).toBe(401);
  });

  it('calls next without an error when the request is authenticated', () => {
    const req = { isAuthenticated: () => true };
    const next = jest.fn();

    requireAuth(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });
});

describe('requireSelf', () => {
  it('calls next with 403 when the session user does not match the path', () => {
    const req = { params: { userId: '2' }, user: { id: 1 } };
    const next = jest.fn();

    requireSelf(req, mockRes(), next);

    expect(next.mock.calls[0][0].status).toBe(403);
  });

  it('calls next without an error when the session user matches the path', () => {
    const req = { params: { userId: '1' }, user: { id: 1 } };
    const next = jest.fn();

    requireSelf(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
