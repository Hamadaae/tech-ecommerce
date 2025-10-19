import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number, symbol: string = '$'): string {
    if (value == null) return '';
    return `${symbol} ${value.toFixed(2)}`;
  }
}
