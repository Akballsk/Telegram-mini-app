import { useMutation, useQuery } from '@tanstack/react-query';

export interface TelegramUser {
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  balance: number;
}

// Global token getter — set once during auth init
let tokenGetter: () => string | null = () => null;

export function setAuthTokenGetter(getter: () => string | null) {
  tokenGetter = getter;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = tokenGetter();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export function useAuthTelegram() {
  return useMutation({
    mutationFn: (args: { data: { initData: string } }) =>
      apiFetch<{ token: string; user: TelegramUser }>('/api/auth/telegram', {
        method: 'POST',
        body: JSON.stringify(args.data),
      }),
  });
}

// ── Balance ─────────────────────────────────────────────────────────────────

export function getGetBalanceQueryKey(params: { telegramId: string }) {
  return ['balance', params] as const;
}

export function useGetBalance(
  params: { telegramId: string },
  options?: { query?: { enabled?: boolean; queryKey?: readonly unknown[] } },
) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetBalanceQueryKey(params),
    queryFn: () =>
      apiFetch<{ balance: number }>(
        `/api/wallet/balance?telegramId=${encodeURIComponent(params.telegramId)}`,
      ),
    enabled: options?.query?.enabled,
  });
}

// ── Deposit ─────────────────────────────────────────────────────────────────

export function useCreateDeposit() {
  return useMutation({
    mutationFn: (args: { data: { telegramId: string; amount: number; note: string } }) =>
      apiFetch<{ success: boolean }>('/api/wallet/deposit', {
        method: 'POST',
        body: JSON.stringify(args.data),
      }),
  });
}

// ── Withdrawal ───────────────────────────────────────────────────────────────

export function useCreateWithdrawal() {
  return useMutation({
    mutationFn: (args: { data: { telegramId: string; amount: number; note: string } }) =>
      apiFetch<{ success: boolean }>('/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify(args.data),
      }),
  });
}

// ── History ──────────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  note?: string;
}

export function getGetHistoryQueryKey(params: { telegramId: string }) {
  return ['history', params] as const;
}

export function useGetHistory(
  params: { telegramId: string },
  options?: { query?: { enabled?: boolean; queryKey?: readonly unknown[] } },
) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetHistoryQueryKey(params),
    queryFn: () =>
      apiFetch<{ transactions: Transaction[] }>(
        `/api/wallet/history?telegramId=${encodeURIComponent(params.telegramId)}`,
      ),
    enabled: options?.query?.enabled,
  });
}
