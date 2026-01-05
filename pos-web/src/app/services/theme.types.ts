export type ClientTheme = {
  clientId: string;
  clientName: string;
  brandMark: string; // small text logo for now
  supportPhone: string;
  contactAddress: string;

  // CSS tokens
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  accentColor: string;
  accentColor2: string;
  backgroundImageUrl?: string;
};

