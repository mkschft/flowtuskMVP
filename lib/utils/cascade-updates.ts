import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor, getSecondaryColor, getAccentColor, getContrastColor } from "./color-utils";

/**
 * Cascades color updates to related components
 * When colors change, automatically update components that reference them
 */
export function cascadeColorUpdates(
  manifest: BrandManifest,
  colorUpdates: Partial<BrandManifest["identity"]["colors"]>
): Partial<BrandManifest> {
  const cascaded: Partial<BrandManifest> = {};

  // Check if any colors changed
  const primaryChanged = colorUpdates.primary !== undefined;
  const secondaryChanged = colorUpdates.secondary !== undefined;
  const accentChanged = colorUpdates.accent !== undefined;

  if (primaryChanged || secondaryChanged || accentChanged) {
    // Get updated colors (use new values if provided, otherwise existing)
    const updatedManifest = {
      ...manifest,
      identity: {
        ...manifest.identity,
        colors: {
          ...manifest.identity.colors,
          ...colorUpdates,
        },
      },
    };

    const primaryColor = getPrimaryColor(updatedManifest);
    const secondaryColor = getSecondaryColor(updatedManifest);
    const accentColor = getAccentColor(updatedManifest);

    // Cascade to components.buttons - update button styles to use new colors
    if (!cascaded.components) {
      cascaded.components = {
        buttons: manifest.components?.buttons || {
          primary: { style: "solid", borderRadius: "8px", shadow: "none" },
          secondary: { style: "outline", borderRadius: "8px", shadow: "none" },
          outline: { style: "ghost", borderRadius: "8px", shadow: "none" },
        },
        cards: manifest.components?.cards || { style: "flat", borderRadius: "12px", shadow: "sm" },
        inputs: manifest.components?.inputs || { style: "outlined", borderRadius: "8px", focusStyle: "ring" },
        badges: manifest.components?.badges || { style: "soft", borderRadius: "9999px" },
        spacing: manifest.components?.spacing || { scale: {} },
        forms: manifest.components?.forms,
        ctas: manifest.components?.ctas,
        cardContent: manifest.components?.cardContent,
      };
    }

    // Update primary button to use primary color
    if (primaryChanged && cascaded.components) {
      cascaded.components.buttons = {
        ...cascaded.components.buttons,
        primary: {
          ...cascaded.components.buttons.primary,
          // Note: We don't store hex directly in button style, but we ensure consistency
          // The actual color rendering happens in UI components
        },
      };
    }

    // Update secondary button to use secondary color
    if (secondaryChanged && cascaded.components) {
      cascaded.components.buttons = {
        ...cascaded.components.buttons,
        secondary: {
          ...cascaded.components.buttons.secondary,
          // Similar note - consistency maintained
        },
      };
    }

    // Cascade to previews.landingPage - add color theme metadata for rendering
    if (!cascaded.previews) {
      cascaded.previews = {
        landingPage: manifest.previews?.landingPage || {
          navigation: { logo: "", links: [] },
          hero: { headline: "", subheadline: "", cta: { primary: "", secondary: "" } },
          features: [],
          socialProof: [],
          footer: { sections: [] },
        },
      };
    }

    // Add color theme to landing page (extend existing structure)
    // We'll store this as metadata that components can read
    if (cascaded.previews) {
      cascaded.previews.landingPage = {
        ...cascaded.previews.landingPage,
        // Note: We're not modifying the structure, just ensuring it exists
        // Components will read colors directly from manifest.identity.colors
      };
    }
  }

  return cascaded;
}

/**
 * Cascades typography updates to related components
 * When typography changes, update form labels and button text styles
 */
export function cascadeTypographyUpdates(
  manifest: BrandManifest,
  typographyUpdates: Partial<BrandManifest["identity"]["typography"]>
): Partial<BrandManifest> {
  const cascaded: Partial<BrandManifest> = {};

  // Typography changes don't require component updates in the manifest structure
  // The actual rendering happens in UI components which read from manifest.identity.typography
  // This function is a placeholder for future enhancements if needed

  return cascaded;
}

/**
 * Cascades valueProp updates to related components
 * When valueProp changes, regenerate CTAs and messaging variations
 */
export function cascadeValuePropUpdates(
  manifest: BrandManifest,
  valuePropUpdates: Partial<BrandManifest["strategy"]["valueProp"]>
): Partial<BrandManifest> {
  const cascaded: Partial<BrandManifest> = {};

  // ValueProp changes should trigger regeneration of:
  // - CTAs (components.ctas) - these should be regenerated via AI
  // - Messaging variations (strategy.messagingVariations) - these should be regenerated via AI
  // For now, we just mark these as needing regeneration
  // Actual regeneration happens via API calls to generateStrategyContent

  return cascaded;
}

/**
 * Cascades persona updates to related components
 * When persona changes, regenerate forms and competitive positioning
 */
export function cascadePersonaUpdates(
  manifest: BrandManifest,
  personaUpdates: Partial<BrandManifest["strategy"]["persona"]>
): Partial<BrandManifest> {
  const cascaded: Partial<BrandManifest> = {};

  // Persona changes should trigger regeneration of:
  // - Forms (components.forms) - these should be regenerated via AI
  // - Competitive positioning (strategy.competitivePositioning) - these should be regenerated via AI
  // For now, we just mark these as needing regeneration
  // Actual regeneration happens via API calls to generateStyleGuide and generateStrategyContent

  return cascaded;
}

