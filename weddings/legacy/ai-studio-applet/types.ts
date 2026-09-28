export type Language = 'pt' | 'en';

export interface FormData {
  // Step 1: Contact
  fullName: string;
  whatsapp: string;
  email: string;

  // Step 2: Date
  dateRange: string;

  // Step 3: Location
  city: string;
  church: string;
  customLocation?: string;

  // Step 4: Vision
  budget: string;
  vision: string;

  // Step 5: Music (Changed from specific moments to style selection)
  musicStyles: string[]; // Array of selected styles (max 3)
  calculatedProfile?: string; // The "score" or profile name derived from styles

  // Step 6: Special
  specialSong: string;
}

export type StepProps = {
  formData: FormData;
  updateData: (fields: Partial<FormData>) => void;
  language: Language;
  onNext?: () => void;
};