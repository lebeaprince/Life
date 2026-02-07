import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CartService } from '../core/cart.service';
import { CheckoutService } from '../core/checkout.service';
import {
  combineLatest,
  catchError,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  take,
  tap
} from 'rxjs';
import { CartItem, PaymentOption, PaymentType } from '../core/models';
import { LoyaltyService, LoyaltySummary } from '../core/loyalty.service';

@Injectable({ providedIn: 'root' })
export class CheckoutController {
  readonly items$: Observable<CartItem[]>;
  readonly totals$: Observable<{ subtotal: number; tax: number; total: number; discount: number }>;
  readonly paymentOptions$: Observable<PaymentOption[]>;
  paymentTypeControl = new FormControl<PaymentType>('cash', { nonNullable: true });
  notifyWhenReadyControl = new FormControl<boolean>(false, { nonNullable: true });
  customerNameControl = new FormControl<string>('', { nonNullable: true });
  customerPhoneControl = new FormControl<string>('', { nonNullable: true });
  redeemRewardControl = new FormControl<boolean>(false, { nonNullable: true });
  readonly loyaltySummary$: Observable<LoyaltySummary | null>;

  constructor(
    private readonly cartService: CartService,
    private readonly checkoutService: CheckoutService,
    private readonly loyaltyService: LoyaltyService
  ) {
    this.items$ = this.cartService.items$;
    this.paymentOptions$ = this.checkoutService.paymentOptions$;

    this.notifyWhenReadyControl.valueChanges
      .pipe(startWith(this.notifyWhenReadyControl.value))
      .subscribe((notify) => {
        if (notify) {
          this.customerNameControl.addValidators([Validators.required]);
          this.customerPhoneControl.addValidators([Validators.required]);
        } else {
          this.customerNameControl.clearValidators();
          this.customerPhoneControl.clearValidators();
          this.customerNameControl.setValue('', { emitEvent: false });
          this.customerPhoneControl.setValue('', { emitEvent: false });
          this.redeemRewardControl.setValue(false, { emitEvent: false });
        }
        this.customerNameControl.updateValueAndValidity({ emitEvent: false });
        this.customerPhoneControl.updateValueAndValidity({ emitEvent: false });
      });

    this.loyaltySummary$ = combineLatest([
      this.notifyWhenReadyControl.valueChanges.pipe(
        startWith(this.notifyWhenReadyControl.value),
        distinctUntilChanged()
      ),
      this.customerPhoneControl.valueChanges.pipe(
        startWith(this.customerPhoneControl.value),
        map((value) => value.trim()),
        debounceTime(250),
        distinctUntilChanged()
      )
    ]).pipe(
      switchMap(([notify, phone]) => {
        if (!notify || !phone) {
          return of(null);
        }
        return this.loyaltyService.lookup(phone);
      }),
      catchError(() => of(null)),
      tap((summary) => {
        if (!summary?.rewardAvailable) {
          this.redeemRewardControl.setValue(false, { emitEvent: false });
        }
      })
    );

    this.totals$ = combineLatest([
      this.checkoutService.totals$,
      this.loyaltySummary$,
      this.redeemRewardControl.valueChanges.pipe(startWith(this.redeemRewardControl.value))
    ]).pipe(
      map(([totals, summary, redeemReward]) => {
        const canRedeem = !!summary?.rewardAvailable && redeemReward;
        const discount = canRedeem ? totals.total : 0;
        return {
          subtotal: totals.subtotal,
          tax: totals.tax,
          discount,
          total: Math.max(0, totals.total - discount)
        };
      })
    );
  }

  removeItem(productId: string): void {
    this.cartService.removeItem(productId);
  }

  updateQuantity(productId: string, rawValue: string): void {
    const quantity = Number.parseInt(rawValue, 10);
    if (!Number.isNaN(quantity)) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  async completeSale(): Promise<void> {
    if (this.notifyWhenReadyControl.value) {
      if (this.customerNameControl.invalid || this.customerPhoneControl.invalid) {
        this.customerNameControl.markAsTouched();
        this.customerPhoneControl.markAsTouched();
        return;
      }
    }
    const [summary, totals] = await firstValueFrom(
      combineLatest([this.loyaltySummary$, this.totals$]).pipe(take(1))
    );
    const redeemReward = !!summary?.rewardAvailable && this.redeemRewardControl.value;

    await this.checkoutService.completeCheckout({
      paymentType: this.paymentTypeControl.value,
      notifyWhenReady: this.notifyWhenReadyControl.value,
      customerName: this.customerNameControl.value,
      customerPhone: this.customerPhoneControl.value,
      redeemReward,
      totalOverride: totals.total
    });
  }
}
