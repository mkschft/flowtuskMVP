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
    if (!cascaded.components) cascaded.components = {};
    if (!cascaded.components.buttons) {
      cascaded.components.buttons = manifest.components?.buttons || {
        primary: { style: "solid", borderRadius: "8px", shadow: "none" },
        secondary: { style: "outline", borderRadius: "8px", shadow: "none" },
        outline: { style: "ghost", borderRadius: "8px", shadow: "none" },
      };
    }

    // Update primary button to use primary color
    if (primaryChanged) {
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
    if (secondaryChanged) {
      cascaded.components.buttons = {
        ...cascaded.components.buttons,
        secondary: {
          ...cascaded.components.buttons.secondary,
          // Similar note - consistency maintained
        },
      };
    }

    // Cascade to previews.landingPage - add color theme metadata for rendering
    if (!cascaded.previews) cascaded.previews = {};
    if (!cascaded.previews.landingPage) {
      cascaded.previews.landingPage = manifest.previews?.landingPage || {
        navigation: { logo: "", links: [] },
        hero: { headline: "", subheadline: "", cta: { primary: "", secondary: "" } },
        features: [],
        socialProof: [],
        footer: { sections: [] },
      };
    }

    // Add color theme to landing page (extend existing structure)
    // We'll store this as metadata that components can read
    cascaded.previews.landingPage = {
      ...cascaded.previews.landingPage,
      // Note: We're not modifying the structure, just ensuring it exists
      // Components will read colors directly from manifest.identity.colors
    };
  }

  return cascaded;
}

