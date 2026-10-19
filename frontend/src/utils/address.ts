export interface Address {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export const emptyAddress = (): Address => ({
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  country: ''
});

const requiredFields: { key: keyof Address; message: string }[] = [
  { key: 'fullName', message: 'Enter a full name' },
  { key: 'line1', message: 'Enter an address' },
  { key: 'city', message: 'Enter a city' },
  { key: 'region', message: 'Enter a state or region' },
  { key: 'postalCode', message: 'Enter a postal code' },
  { key: 'country', message: 'Enter a country' }
];

export type AddressErrors = Partial<Record<keyof Address, string>>;

export function validateAddress(address: Address): AddressErrors {
  const errors: AddressErrors = {};
  for (const field of requiredFields) {
    if (!address[field.key].trim()) {
      errors[field.key] = field.message;
    }
  }
  return errors;
}

export function normalizeAddress(address: Address): Address {
  return {
    fullName: address.fullName.trim(),
    line1: address.line1.trim(),
    line2: address.line2.trim(),
    city: address.city.trim(),
    region: address.region.trim(),
    postalCode: address.postalCode.trim(),
    country: address.country.trim()
  };
}

export function addressesMatch(a?: Address | null, b?: Address | null) {
  if (!a || !b) return false;
  const left = normalizeAddress(a);
  const right = normalizeAddress(b);
  return (Object.keys(left) as (keyof Address)[]).every((key) => left[key] === right[key]);
}

export function formatAddressLines(address: Address) {
  const locality = [address.city, address.region, address.postalCode]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');

  return [address.fullName, address.line1, address.line2, locality, address.country]
    .map((line) => line.trim())
    .filter(Boolean);
}
