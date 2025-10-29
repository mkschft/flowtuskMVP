/**
 * Prompt Templates - Constants for email and LinkedIn generation
 *
 * Consolidates template styles and best practices
 * for consistent content generation across the app.
 */

// Email template styles
export const EMAIL_STYLES = {
  GREETINGS: {
    name: "Greetings",
    description: "Friendly introduction with value proposition",
    tone: "warm and conversational",
  },
  BOOK_A_CALL: {
    name: "Book a Call",
    description: "Direct call-to-action to schedule a meeting",
    tone: "professional and concise",
  },
} as const;

// LinkedIn content tones
export const LINKEDIN_TONES = {
  PRACTICAL: {
    name: "Practical",
    description: "Actionable insights and real-world application",
    style: "1 hook line, 3 bullets, 1 CTA",
  },
  THOUGHT_LEADERSHIP: {
    name: "Thought Leadership",
    description: "Industry perspective and strategic thinking",
    style: "Story-driven with key takeaways",
  },
} as const;

// Email sequence pacing rules (already defined in generate-email-sequence/route.ts)
export const SEQUENCE_PACING = {
  5: [1, 3, 5, 7, 10],
  7: [1, 3, 5, 7, 10, 14, 21],
  10: [1, 3, 5, 7, 10, 14, 17, 21, 28, 35],
} as const;

// B2B email best practices
export const EMAIL_BEST_PRACTICES = [
  "Keep subject lines under 50 characters",
  "Body text should be 150-200 words",
  "Include one clear CTA per email",
  "Address pain points early",
  "Use short paragraphs (2-3 lines max)",
  "Personalize beyond just {{firstName}}",
] as const;

// LinkedIn character limits
export const LINKEDIN_LIMITS = {
  POST_MAX: 3000,
  POST_OPTIMAL: 1300, // Best engagement
  CONNECTION_REQUEST_MAX: 300,
  INMAIL_MAX: 2000,
  INMAIL_OPTIMAL: 120, // Best response rate
} as const;

// Email benchmarks (B2B SaaS averages)
export const EMAIL_BENCHMARKS = {
  ONE_TIME: {
    openRate: "25-35%",
    replyRate: "5-8%",
    conversionRate: "2-5%",
  },
  SEQUENCE: {
    openRate: "30-40%",
    replyRate: "8-12%",
    conversionRate: "5-10%",
  },
} as const;

// LinkedIn benchmarks
export const LINKEDIN_BENCHMARKS = {
  CONNECTION_ACCEPTANCE: "30-40%",
  MESSAGE_RESPONSE: "10-15%",
  POST_ENGAGEMENT: "2-5%",
} as const;

export default {
  EMAIL_STYLES,
  LINKEDIN_TONES,
  SEQUENCE_PACING,
  EMAIL_BEST_PRACTICES,
  LINKEDIN_LIMITS,
  EMAIL_BENCHMARKS,
  LINKEDIN_BENCHMARKS,
};
