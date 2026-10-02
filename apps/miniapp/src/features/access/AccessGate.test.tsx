import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AccessGate } from './AccessGate';
import { api } from '../../lib/api';
vi.mock('../../lib/api', () => ({ api: { accessStatus: vi.fn(), redeemCode: vi.fn() } }));
describe('AccessGate', () => {
  it('does not mount protected content until admission is confirmed', async () => {
    vi.mocked(api.accessStatus)
      .mockResolvedValueOnce({ ok: true, telegramId: 1, gateEnabled: true, admitted: false })
      .mockResolvedValueOnce({ ok: true, telegramId: 1, gateEnabled: true, admitted: true });
    vi.mocked(api.redeemCode).mockResolvedValue({ ok: true, admitted: true });
    render(
      <AccessGate>
        <p>Protected content</p>
      </AccessGate>,
    );
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    await userEvent.type(await screen.findByLabelText('Access code'), 'ABCD');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Protected content')).toBeInTheDocument();
  });
  it('fails closed when Telegram authentication cannot be verified', async () => {
    vi.mocked(api.accessStatus).mockRejectedValue(new Error('401'));
    render(
      <AccessGate>
        <p>Protected content</p>
      </AccessGate>,
    );
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Open Qahal in Telegram'),
    );
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
