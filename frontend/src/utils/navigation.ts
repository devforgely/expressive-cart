export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/';
  }

  if (value.startsWith('/login') || value.startsWith('/register')) {
    return '/';
  }

  return value;
}
