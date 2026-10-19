const bcrypt = require('bcryptjs');

const mockFindOneByEmail = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../models/user', () => {
  return jest.fn().mockImplementation(() => ({
    findOneByEmail: mockFindOneByEmail,
    create: mockCreate,
    update: mockUpdate
  }));
});

const AuthService = require('./AuthService');

describe('AuthService', () => {
  const service = new AuthService();

  beforeEach(() => {
    mockFindOneByEmail.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
  });

  it('hashes passwords on register and omits them from the response', async () => {
    mockFindOneByEmail.mockResolvedValue(null);
    mockCreate.mockImplementation(async (data) => ({
      id: 1,
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName
    }));

    const result = await service.register({
      email: 'shopper@example.com',
      password: 'password123',
      firstName: 'Ada',
      lastName: 'Lovelace'
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const storedPassword = mockCreate.mock.calls[0][0].password;
    expect(storedPassword).not.toBe('password123');
    expect(await bcrypt.compare('password123', storedPassword)).toBe(true);
    expect(result.password).toBeUndefined();
    expect(result.email).toBe('shopper@example.com');
  });

  it('rejects duplicate emails', async () => {
    mockFindOneByEmail.mockResolvedValue({ id: 1, email: 'shopper@example.com' });

    await expect(service.register({
      email: 'shopper@example.com',
      password: 'password123'
    })).rejects.toMatchObject({ status: 409 });
  });

  it('authenticates against the hashed password', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    mockFindOneByEmail.mockResolvedValue({
      id: 1,
      email: 'shopper@example.com',
      password: hashed
    });

    const result = await service.login({
      email: 'shopper@example.com',
      password: 'password123'
    });

    expect(result.password).toBeUndefined();
    expect(result.id).toBe(1);
  });

  it('rejects an incorrect password', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    mockFindOneByEmail.mockResolvedValue({
      id: 1,
      email: 'shopper@example.com',
      password: hashed
    });

    await expect(service.login({
      email: 'shopper@example.com',
      password: 'wrong-password'
    })).rejects.toMatchObject({ status: 401 });
  });

  it('creates a Google user when the email is new', async () => {
    mockFindOneByEmail.mockResolvedValue(null);
    mockCreate.mockImplementation(async (data) => ({
      id: 2,
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      social_auth: data.socialAuth
    }));

    const result = await service.findOrCreateGoogleUser({
      id: 'google-1',
      emails: [{ value: 'Ada@Example.com' }],
      name: { givenName: 'Ada', familyName: 'Lovelace' }
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const stored = mockCreate.mock.calls[0][0];
    expect(stored.email).toBe('ada@example.com');
    expect(stored.socialAuth).toEqual({ provider: 'google', id: 'google-1' });
    expect(stored.password).toEqual(expect.any(String));
    expect(result.password).toBeUndefined();
    expect(result.email).toBe('ada@example.com');
  });

  it('links Google to an existing email instead of creating a second account', async () => {
    mockFindOneByEmail.mockResolvedValue({
      id: 1,
      email: 'ada@example.com',
      password: 'hash'
    });
    mockUpdate.mockResolvedValue({ id: 1 });

    const result = await service.findOrCreateGoogleUser({
      id: 'google-1',
      emails: [{ value: 'ada@example.com' }],
      name: { givenName: 'Ada', familyName: 'Lovelace' }
    });

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith({
      id: 1,
      socialAuth: { provider: 'google', id: 'google-1' }
    });
    expect(result.password).toBeUndefined();
    expect(result.id).toBe(1);
  });

  it('rejects a Google profile with no email', async () => {
    await expect(service.findOrCreateGoogleUser({
      id: 'google-1',
      emails: []
    })).rejects.toMatchObject({ status: 400 });
  });
});
