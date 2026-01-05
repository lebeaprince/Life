import { computed, Injectable, signal } from '@angular/core';
import { ThemeService } from './theme.service';

export type DashboardKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type DashboardData = {
  clientName: string;
  asOf: string;
  kpis: DashboardKpi[];
  notices: { title: string; body: string }[];
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  readonly data = computed<DashboardData>(() => {
    const theme = this.themeService.theme();
    const now = new Date();
    const seed = hashString(theme.clientId + now.toDateString());

    const sales = 1200 + (seed % 5000);
    const orders = 35 + (seed % 80);
    const refunds = seed % 4;
    const staffOnDuty = 3 + (seed % 7);

    return {
      clientName: theme.clientName,
      asOf: now.toLocaleString(),
      kpis: [
        { label: "Today's sales", value: formatMoney(sales), hint: 'Gross' },
        { label: 'Orders', value: String(orders), hint: 'Completed today' },
        { label: 'Refunds', value: String(refunds), hint: 'Today' },
        { label: 'Staff on duty', value: String(staffOnDuty) }
      ],
      notices: [
        {
          title: 'Tip',
          body: 'Use the side menu to navigate. The layout and colors are client-theme driven.'
        },
        {
          title: 'Status',
          body: 'Demo dashboard data is generated from the selected client theme.'
        }
      ]
    };
  });

  constructor(private readonly themeService: ThemeService) {}
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount);
}

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

