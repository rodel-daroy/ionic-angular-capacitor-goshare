import {Component, forwardRef, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-rating-bar',
  templateUrl: './rating-bar.component.html',
  styleUrls: ['./rating-bar.component.scss'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RatingBarComponent), multi: true}
  ],
  encapsulation: ViewEncapsulation.None
})
export class RatingBarComponent implements OnInit {

  @Input() max = 5;
  @Input() readOnly = false;

  range: Array<number>;
  innerValue: any;
  propagateChange: any = () => {
  };

  constructor() { }

  ngOnInit() {
    const states: Array<number> = [];

    for (let i = 0; i < this.max; i++) {
      if (this.innerValue > i && this.innerValue < i + 1) {
        states[i] = 2;
      } else if (this.innerValue > i) {
        states[i] = 1;
      } else {
        states[i] = 0;
      }
    }

    this.range = states;
  }

  get value(): any {
    return this.innerValue;
  }

  set value(val: any) {
    if (val !== this.innerValue) {
      this.innerValue = val;
      this.propagateChange(val);
    }
  }

  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {
  }

  rate(amount: number) {
    if (!this.readOnly && amount >= 0 && amount <= this.range.length) {
      this.value = amount;
    }
  }

}
