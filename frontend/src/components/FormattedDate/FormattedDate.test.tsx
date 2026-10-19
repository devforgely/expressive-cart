import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormattedDate } from './FormattedDate';

describe('FormattedDate', () => {
  it('renders an invalid date fallback', () => {
    render(<FormattedDate>not-a-date</FormattedDate>);
    expect(screen.getByText('Invalid Date')).toBeInTheDocument();
  });

  it('renders a formatted date', () => {
    render(<FormattedDate format="L">2020-01-15T00:00:00.000Z</FormattedDate>);
    const time = screen.getByRole('time');
    expect(time).toHaveAttribute('datetime', '2020-01-15T00:00:00.000Z');
    expect(time.textContent).toMatch(/2020/);
  });
});
