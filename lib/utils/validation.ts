import { z } from 'zod';

/**
 * Centralized validation schemas for AI-generated content
 * 
 * This module provides runtime validation using Zod to catch AI output errors
 * before they corrupt the database or cause UI issues.
 */

// ============================================================================
// Color Schemas
// ============================================================================

export const ColorSchemeSchema = z.object({
    name: z.string().min(1, "Color name is required"),
    hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be valid hex format (#RRGGBB)"),
    usage: z.string().min(1, "Color usage description is required")
});

export const ColorsSchema = z.object({
    primary: z.array(ColorSchemeSchema).min(1, "At least 1 primary color required"),
    secondary: z.array(ColorSchemeSchema).min(1, "At least 1 secondary color required"),
    accent: z.array(ColorSchemeSchema).min(1, "At least 1 accent color required"),
    neutral: z.array(ColorSchemeSchema).min(2, "At least 2 neutral colors required (e.g., white, gray, black)")
});

// ============================================================================
// Typography Schemas
// ============================================================================

const FontConfigSchema = z.object({
    family: z.string().min(1, "Font family is required"),
    weights: z.array(z.string()).min(1, "At least 1 font weight required"),
    sizes: z.record(z.string()).refine(
        (sizes) => Object.keys(sizes).length > 0,
        "At least 1 font size required"
    )
});

export const TypographySchema = z.object({
    heading: FontConfigSchema,
    body: FontConfigSchema
});

// ============================================================================
// Tone & Personality Schemas
// ============================================================================

const PersonalityTraitSchema = z.object({
    trait: z.string().min(1, "Trait name is required"),
    value: z.number().min(0).max(100, "Personality value must be between 0-100"),
    leftLabel: z.string().min(1, "Left label is required"),
    rightLabel: z.string().min(1, "Right label is required")
});

export const ToneSchema = z.object({
    keywords: z.array(z.string()).min(3, "At least 3 tone keywords required"),
    personality: z.array(PersonalityTraitSchema).min(2, "At least 2 personality traits required")
});

// ============================================================================
// Logo Schemas
// ============================================================================

const LogoVariationSchema = z.object({
    name: z.string().min(1, "Logo variation name is required"),
    description: z.string().min(1, "Logo variation description is required"),
    imageUrl: z.string().optional(), // Optional since generation can fail
    imageUrlSvg: z.string().optional(),
    imageUrlStockimg: z.string().optional()
});

export const LogoSchema = z.object({
    variations: z.array(LogoVariationSchema).min(2, "At least 2 logo variations required")
});

// ============================================================================
// Brand Guide Output Schema (from AI)
// ============================================================================

export const BrandGuideOutputSchema = z.object({
    colors: ColorsSchema,
    typography: TypographySchema,
    tone: ToneSchema,
    logo: LogoSchema
});

// ============================================================================
// Style Guide Schemas
// ============================================================================

const ButtonStyleSchema = z.object({
    style: z.string(),
    borderRadius: z.string(),
    shadow: z.string()
});

const CardStyleSchema = z.object({
    style: z.string(),
    borderRadius: z.string(),
    shadow: z.string()
});

const InputStyleSchema = z.object({
    style: z.string(),
    borderRadius: z.string(),
    focusStyle: z.string()
});

const SpacingSchema = z.object({
    scale: z.record(z.string()).refine(
        (scale) => {
            const required = ['xs', 'sm', 'md', 'lg', 'xl'];
            const keys = Object.keys(scale);
            return required.every(key => keys.includes(key));
        },
        "Spacing scale must include xs, sm, md, lg, xl"
    )
});

export const StyleGuideOutputSchema = z.object({
    buttons: z.record(ButtonStyleSchema),
    cards: CardStyleSchema,
    inputs: InputStyleSchema,
    spacing: SpacingSchema
});

// ============================================================================
// Landing Page Schemas
// ============================================================================

const NavigationSchema = z.object({
    logo: z.string(),
    links: z.array(z.string()).min(3, "At least 3 navigation links required")
});

const HeroSchema = z.object({
    headline: z.string().min(1, "Hero headline is required"),
    subheadline: z.string().min(1, "Hero subheadline is required"),
    cta: z.object({
        primary: z.string(),
        secondary: z.string()
    })
});

const FeatureSchema = z.object({
    title: z.string().min(1, "Feature title is required"),
    description: z.string().min(1, "Feature description is required"),
    icon: z.string()
});

const SocialProofSchema = z.object({
    type: z.enum(['testimonial', 'stat'], {
        errorMap: () => ({ message: "Social proof type must be 'testimonial' or 'stat'" })
    }),
    content: z.string().min(1, "Social proof content is required")
});

const FooterSectionSchema = z.object({
    title: z.string(),
    links: z.array(z.string())
});

const FooterSchema = z.object({
    sections: z.array(FooterSectionSchema).min(2, "At least 2 footer sections required")
});

export const LandingPageOutputSchema = z.object({
    navigation: NavigationSchema.optional(), // Optional for backward compatibility
    hero: HeroSchema,
    features: z.array(FeatureSchema).min(4, "At least 4 features required"),
    socialProof: z.array(SocialProofSchema).min(2, "At least 2 social proof items required"),
    footer: FooterSchema.optional() // Optional for backward compatibility
});

// ============================================================================
// Persona Update Schema (for Copilot market_shift)
// ============================================================================

export const PersonaUpdateSchema = z.object({
    name: z.string()
        .min(1, "Persona name is required")
        .refine(
            val => !val.toLowerCase().includes('update') &&
                !val.toLowerCase().includes('reflect') &&
                !val.toLowerCase().includes('persona'),
            { message: "Persona name cannot be placeholder text like 'Update the persona...' or 'Reflect...'" }
        ),
    role: z.string()
        .min(1, "Persona role is required")
        .refine(
            val => !val.toLowerCase().includes('update') && !val.toLowerCase().includes('reflect'),
            { message: "Persona role cannot be placeholder text" }
        ),
    company: z.string()
        .min(1, "Persona company is required")
        .refine(
            val => !val.toLowerCase().includes('update') && !val.toLowerCase().includes('reflect'),
            { message: "Persona company cannot be placeholder text" }
        ),
    industry: z.string().min(1, "Persona industry is required"),
    location: z.string()
        .min(1, "Persona location is required")
        .refine(
            val => !val.toLowerCase().includes('update') && !val.toLowerCase().includes('reflect'),
            { message: "Persona location cannot be placeholder text" }
        ),
    country: z.string()
        .min(1, "Persona country is required")
        .refine(
            val => !val.toLowerCase().includes('update') && !val.toLowerCase().includes('reflect'),
            { message: "Persona country cannot be placeholder text" }
        ),
    painPoints: z.array(z.string()).min(1, "At least 1 pain point required"),
    goals: z.array(z.string()).min(1, "At least 1 goal required")
});

// ============================================================================
// Value Prop Schema (for Copilot messaging updates)
// ============================================================================

export const ValuePropUpdateSchema = z.object({
    headline: z.string().min(1, "Value prop headline is required"),
    subheadline: z.string().min(1, "Value prop subheadline is required"),
    problem: z.string().min(1, "Problem statement is required"),
    solution: z.string().min(1, "Solution description is required"),
    outcome: z.string().min(1, "Outcome description is required"),
    benefits: z.array(z.string()).min(1, "At least 1 benefit required"),
    targetAudience: z.string().min(1, "Target audience is required")
});

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate brand guide output from AI
 * @throws Error with detailed validation messages if invalid
 */
export function validateBrandGuideOutput(data: unknown) {
    const result = BrandGuideOutputSchema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map(issue => {
            const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
            return `  - ${path}${issue.message}`;
        }).join('\n');

        throw new Error(`Brand guide validation failed:\n${errors}\n\nThis means the AI didn't generate complete brand guide data. Please try again or contact support.`);
    }

    return result.data;
}

/**
 * Validate style guide output from AI
 * @throws Error with detailed validation messages if invalid
 */
export function validateStyleGuideOutput(data: unknown) {
    const result = StyleGuideOutputSchema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map(issue => {
            const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
            return `  - ${path}${issue.message}`;
        }).join('\n');

        throw new Error(`Style guide validation failed:\n${errors}\n\nThis means the AI didn't generate complete style guide data. Please try again.`);
    }

    return result.data;
}

/**
 * Validate landing page output from AI
 * @throws Error with detailed validation messages if invalid
 */
export function validateLandingPageOutput(data: unknown) {
    const result = LandingPageOutputSchema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map(issue => {
            const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
            return `  - ${path}${issue.message}`;
        }).join('\n');

        throw new Error(`Landing page validation failed:\n${errors}\n\nThis means the AI didn't generate complete landing page data. Please try again.`);
    }

    return result.data;
}

/**
 * Validate persona update from Copilot (for market_shift)
 * @throws Error with detailed validation messages if invalid
 */
export function validatePersonaUpdate(data: unknown) {
    const result = PersonaUpdateSchema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map(issue => {
            const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
            return `  - ${path}${issue.message}`;
        }).join('\n');

        throw new Error(`Persona update validation failed:\n${errors}\n\nPlease provide complete persona details (name, role, company, location, country, pain points, and goals) without placeholder text.`);
    }

    return result.data;
}

/**
 * Validate value prop update from Copilot (for messaging updates)
 * @throws Error with detailed validation messages if invalid
 */
export function validateValuePropUpdate(data: unknown) {
    const result = ValuePropUpdateSchema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map(issue => {
            const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
            return `  - ${path}${issue.message}`;
        }).join('\n');

        throw new Error(`Value prop update validation failed:\n${errors}\n\nPlease provide complete value proposition with all required fields.`);
    }

    return result.data;
}

/**
 * Safe parse with logging - validates without throwing
 * Useful for non-critical validations or when you want to log but not fail
 */
export function safeValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context: string
): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map(issue => {
            const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
            return `${path}${issue.message}`;
        });

        console.error(`❌ [Validation] ${context} validation failed:`, errors);
        return { success: false, errors };
    }

    console.log(`✅ [Validation] ${context} validation passed`);
    return { success: true, data: result.data };
}
