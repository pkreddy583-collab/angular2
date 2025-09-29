export interface OnCallContact {
  name: string;
  avatarUrl: string;
  phone: string;
  chat: string;
}

export interface OnCallShift {
  primary: OnCallContact;
  secondary: OnCallContact;
  manager: OnCallContact;
}

export interface OnCallRoster {
  tower: string;
  team: string;
  currentShift: OnCallShift;
}
