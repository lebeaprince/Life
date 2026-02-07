import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { CartService } from '../core/cart.service';
import { CheckoutService } from '../core/checkout.service';
import { Observable } from 'rxjs';
import { CartItem, PaymentOption, PaymentType } from '../core/models';
import { OrderNotificationInput } from '../core/order.service';

@Injectable({ providedIn: 'root' })
export class CheckoutController {
  readonly items$: Observable<CartItem[]>;
  readonly totals$: Observable<any>;
  readonly paymentOptions$: Observable<PaymentOption[]>;
  readonly errorMessage = signal<string | null>(null);
  paymentTypeControl = new FormControl<PaymentType>('cash', { nonNullable: true });
  notifyCustomerControl = new FormControl(false, { nonNullable: true });
  customerNameControl = new FormControl('', { nonNullable: true });
  customerPhoneControl = new FormControl('', { nonNullable: true });

  constructor(
    private readonly cartService: CartService,
    private readonly checkoutService: CheckoutService
  ) {
    this.items$ = this.cartService.items$;
    this.totals$ = this.checkoutService.totals$;
    this.paymentOptions$ = this.checkoutService.paymentOptions$;

    this.notifyCustomerControl.valueChanges.subscribe((enabled) => {
      if (!enabled) {
        this.customerNameControl.reset('');
        this.customerPhoneControl.reset('');
        this.customerNameControl.markAsUntouched();
        this.customerPhoneControl.markAsUntouched();
        this.errorMessage.set(null);
      }
    });
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
    const notification = this.buildNotificationPayload();
    if (this.notifyCustomerControl.value && !notification) {
      return;
    }

    try {
      this.errorMessage.set(null);
      await this.checkoutService.completeCheckout(this.paymentTypeControl.value, notification);
      if (this.notifyCustomerControl.value) {
        this.notifyCustomerControl.setValue(false);
      }
    } catch (error) {
      console.error(error);
      this.errorMessage.set(this.resolveErrorMessage(error));
    }
  }

  private buildNotificationPayload(): OrderNotificationInput | null {
    if (!this.notifyCustomerControl.value) {
      return null;
    }

    const customerName = this.customerNameControl.value.trim();
    const phoneNumber = this.customerPhoneControl.value.trim();
    const digits = phoneNumber.replace(/\D/g, '');

    if (!customerName || !phoneNumber) {
      this.customerNameControl.markAsTouched();
      this.customerPhoneControl.markAsTouched();
      this.errorMessage.set('Customer name and cellphone number are required for SMS updates.');
      return null;
    }

    if (digits.length < 10 || digits.length > 15) {
      this.customerPhoneControl.markAsTouched();
      this.errorMessage.set('Enter a valid cellphone number with 10 to 15 digits.');
      return null;
    }

    return {
      customerName,
      phoneNumber
    };
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409) {
        return 'That cellphone number is already attached to another active order.';
      }
      if (error.status === 400) {
        return error.error?.message ?? 'Unable to save notification details.';
      }
    }
    return 'Unable to complete sale. Please try again.';
  }
}
