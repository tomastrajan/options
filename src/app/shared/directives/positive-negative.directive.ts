import {
  Directive,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[optPositiveNegative]',
})
export class PositiveNegativeDirective implements OnChanges {

  @Input() optPositiveNegative;

  @HostBinding('class.positive') positive = false;
  @HostBinding('class.negative') negative = true;

  ngOnChanges(changes: SimpleChanges): void {
    this.positive = this.optPositiveNegative > 0;
    this.negative = this.optPositiveNegative < 0;
  }

}
