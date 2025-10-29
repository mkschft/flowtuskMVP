/**
 * API Response Validators using Zod
 *
 * Provides runtime validation for all OpenAI API responses
 * to ensure type safety and graceful error handling.
 */

import { z } from 'zod';

// ============================================================================
// ICP (Ideal Customer Profile) Schemas
// ============================================================================

export const ICPSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  painPoints: z.array(z.string().min(1)).min(1).max(10),
  goals: z.array(z.string().min(1)).min(1).max(10),
  demographics: z.string().min(1).max(1000),
  personaName: z.string().min(1).max(100),
  personaRole: z.string().min(1).max(100),
  personaCompany: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
});

export const ICPSummarySchema = z.object({
  businessDescription: z.string().min(1).max(2000),
  targetMarket: z.string().min(1).max(1000),
  painPointsWithMetrics: z.array(
    z.object({
      pain: z.string().min(1).max(500),
      metric: z.string().min(1).max(200),
    })
  ).optional(),
});

export const ICPResponseSchema = z.object({
  icps: z.array(ICPSchema).min(1).max(5),
  summary: ICPSummarySchema.optional(),
});

// ============================================================================
// Value Proposition Schemas
// ============================================================================

export const ValuePropVariableSchema = z.object({
  key: z.string().min(1), // OpenAI returns "key" not "id"
  label: z.string().min(1).max(100),
  type: z.enum(['dropdown', 'input', 'text', 'select', 'number']).optional(), // Added dropdown and input
  options: z.array(z.string()).optional(),
  selectedValue: z.string().min(1).max(500), // OpenAI returns "selectedValue" not "value"
  placeholder: z.string().optional(), // OpenAI includes placeholder
});

export const ValuePropVariationSchema = z.object({
  id: z.string().min(1),
  style: z.string().min(1).max(100), // OpenAI returns "style" not "name"
  text: z.string().min(1).max(1000), // OpenAI returns "text" not "template"
  useCase: z.string().min(1).max(500).optional(), // OpenAI returns "useCase" not "description"
  emoji: z.string().optional(), // OpenAI includes emoji
});

export const ValuePropSummarySchema = z.object({
  approachStrategy: z.string().min(1).max(2000).optional(),
  expectedImpact: z.string().min(1).max(1000).optional(),
  mainInsight: z.string().min(1).max(1000).optional(),
  painPointsAddressed: z.array(z.string()).optional(),
});

export const ValuePropResponseSchema = z.object({
  variables: z.array(ValuePropVariableSchema).min(1).max(20),
  variations: z.array(ValuePropVariationSchema).min(1).max(10),
  summary: ValuePropSummarySchema.optional(),
});

// ============================================================================
// Email Schemas
// ============================================================================

export const OneTimeEmailSchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  subjectLines: z.object({
    A: z.string().min(1).max(200),
    B: z.string().min(1).max(200),
    C: z.string().min(1).max(200),
  }).optional(),
  emailBody: z.string().min(10).max(10000),
  body: z.string().min(10).max(10000).optional(),
  cta: z.string().min(1).max(500),
  callToAction: z.string().min(1).max(500).optional(),
  tone: z.string().min(1).max(100).optional(),
  benchmarks: z.object({
    openRate: z.string(),
    replyRate: z.string(),
    conversionRate: z.string(),
  }).optional(),
  tips: z.array(z.string()).optional(),
});

export const EmailMessageSchema = z.object({
  id: z.string().min(1),
  dayNumber: z.number().int().min(1).max(30),
  subject: z.string().min(1).max(200),
  body: z.string().min(10).max(10000),
  cta: z.string().min(1).max(500),
  callToAction: z.string().min(1).max(500).optional(),
  purpose: z.string().min(1).max(500).optional(),
});

export const EmailSequenceSchema = z.object({
  sequenceLength: z.number().int().min(3).max(30).optional(),
  emails: z.array(EmailMessageSchema).min(3).max(30),
  sequenceGoal: z.string().min(1).max(1000).optional(),
  bestPractices: z.array(z.string()).optional(),
  expectedOutcome: z.string().min(1).max(1000).optional(),
});

// ============================================================================
// LinkedIn Schemas
// ============================================================================

export const LinkedInMessageSchema = z.object({
  id: z.string().min(1),
  dayNumber: z.number().int().min(1).max(30),
  messageType: z.enum(['connection_request', 'follow_up', 'value_share']).optional(),
  subject: z.string().min(1).max(200).optional(),
  body: z.string().min(10).max(3000),
  characterCount: z.number().int().optional(),
  tips: z.array(z.string()).optional(),
});

export const LinkedInOutreachSchema = z.object({
  type: z.enum(['post', 'profile_bio', 'inmail', 'sequence']).optional(),
  content: z.string().min(10).max(5000).optional(),
  body: z.string().min(10).max(5000).optional(),
  suggestedHashtags: z.array(z.string()).optional(),
  callToAction: z.string().min(1).max(500).optional(),
  overallStrategy: z.string().min(1).max(2000).optional(),
  messages: z.array(LinkedInMessageSchema).optional(),
  keyTakeaways: z.array(z.string()).optional(),
});

// ============================================================================
// Validation Result Type
// ============================================================================

export interface ValidationResult<T> {
  ok: boolean;
  data?: T;
  errors?: string[];
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate ICP API response
 */
export function validateICPResponse(data: unknown): ValidationResult<z.infer<typeof ICPResponseSchema>> {
  try {
    const validated = ICPResponseSchema.parse(data);
    return {
      ok: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      ok: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Validate Value Proposition API response
 */
export function validateValuePropResponse(data: unknown): ValidationResult<z.infer<typeof ValuePropResponseSchema>> {
  try {
    const validated = ValuePropResponseSchema.parse(data);
    return {
      ok: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      ok: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Validate One-Time Email API response
 */
export function validateOneTimeEmailResponse(data: unknown): ValidationResult<z.infer<typeof OneTimeEmailSchema>> {
  try {
    const validated = OneTimeEmailSchema.parse(data);
    return {
      ok: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      ok: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Validate Email Sequence API response
 */
export function validateEmailSequenceResponse(data: unknown): ValidationResult<z.infer<typeof EmailSequenceSchema>> {
  try {
    const validated = EmailSequenceSchema.parse(data);
    return {
      ok: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      ok: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Validate LinkedIn Outreach API response
 */
export function validateLinkedInResponse(data: unknown): ValidationResult<z.infer<typeof LinkedInOutreachSchema>> {
  try {
    const validated = LinkedInOutreachSchema.parse(data);
    return {
      ok: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      ok: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Generic validator helper
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return {
      ok: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      ok: false,
      errors: ['Unknown validation error'],
    };
  }
}

// All schemas are already exported above
