import { DateRange, Time } from '@rolster/dates';

export enum PickerListenerEvent {
  Select = 'PickerSelect',
  Now = 'PickerNow',
  Cancel = 'PickerCancel'
}

type PickerValue = DateRange | Date | Time | number;

export interface PickerListener<D extends PickerValue> {
  event: PickerListenerEvent;
  value?: D;
}
