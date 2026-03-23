import type { PhoneNumber } from 'libphonenumber-js/mobile';

let phoneNumber = $state<PhoneNumber | null>(null);

export default {
  get phoneNumber() {
    return phoneNumber;
  },
  set phoneNumber(value: PhoneNumber | null) {
    phoneNumber = value;
  },
};
