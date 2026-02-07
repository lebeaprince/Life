import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoyaltySummary {
  loyaltyEnabled: boolean;
  orderReadyNotificationsEnabled: boolean;
  pointsBalance: number;
  rewardThreshold: number;
  rewardAvailable: boolean;
  pointsToNextReward: number;
  memberName?: string | null;
}

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private readonly http = inject(HttpClient);

  lookup(phone: string): Observable<LoyaltySummary> {
    return this.http.get<LoyaltySummary>(`${environment.apiBaseUrl}/loyalty/members/lookup`, {
      params: { phone }
    });
  }
}
