import { z } from 'zod';

export const TALENT_DOCUMENT_TYPES = [
  'aadhaar',
  'pan',
  'driving_license',
  'other',
] as const;

export const RECRUITER_DOCUMENT_TYPES = [
  'company_registration',
  'gst_certificate',
  'incorporation_certificate',
  'other',
] as const;

export const DOCUMENT_TYPES = [...TALENT_DOCUMENT_TYPES, ...RECRUITER_DOCUMENT_TYPES] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const TALENT_DOC_TYPE_LABELS: Record<string, string> = {
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
  driving_license: 'Driving License',
  other: 'Other',
};

export const RECRUITER_DOC_TYPE_LABELS: Record<string, string> = {
  company_registration: 'Company Registration',
  gst_certificate: 'GST Certificate',
  incorporation_certificate: 'Incorporation Certificate',
  other: 'Other',
};

export const documentSlotSchema = z
  .object({
    docType: z.enum(DOCUMENT_TYPES),
    customType: z.string().optional(),
    file: z.instanceof(File, { message: 'A file is required' }),
  })
  .refine(
    (data) => {
      if (data.docType === 'other') {
        return data.customType && data.customType.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Please specify the document type for "Other"',
      path: ['customType'],
    },
  );

export const documentSubmissionSchema = z.object({
  documents: z
    .array(documentSlotSchema)
    .min(1, 'At least one document is required')
    .max(2, 'You can submit up to 2 documents'),
});

export type DocumentSlotInput = z.infer<typeof documentSlotSchema>;
export type DocumentSubmissionInput = z.infer<typeof documentSubmissionSchema>;
