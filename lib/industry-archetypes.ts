/**
 * Industry Archetypes for Brand Generation
 *
 * Provides industry-specific design guidance to avoid generic AI-generated feel.
 * Each archetype defines color psychology, visual style, typography, tone, and copy patterns.
 */

export interface IndustryArchetype {
  colorPsychology: {
    primary: string[];
    reasoning: string;
    avoid?: string[];
    avoidReason?: string;
    accent?: string[];
    accentReason?: string;
  };
  visualStyle: {
    borderRadius: string;
    shadows: string;
    patterns: string;
    iconStyle: 'outlined' | 'solid' | 'duo-tone';
  };
  typography: {
    heading: string;
    body: string;
    code?: string;
    avoid?: string;
  };
  toneArchetype: string;
  toneKeywords: string[];
  copyPatterns: {
    ctaStyle: string;
    avoidJargon?: string[];
    useWords?: string[];
    canUseJargon?: string[];
    energyLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export const industryArchetypes: Record<string, IndustryArchetype> = {
  // ============================================================================
  // FINANCE & FINTECH
  // ============================================================================
  'finance': {
    colorPsychology: {
      primary: ['navy', 'royal-blue', 'forest-green', 'teal'],
      reasoning: 'Trust, stability, wealth - core values in financial services',
      accent: ['gold', 'copper', 'emerald'],
      accentReason: 'Premium feel, wealth association',
      avoid: ['bright-red', 'neon-colors'],
      avoidReason: 'Associated with debt, risk, instability'
    },
    visualStyle: {
      borderRadius: '8px',
      shadows: 'subtle elevation for premium feel',
      patterns: 'Clean grids, data visualization, chart-inspired',
      iconStyle: 'outlined'
    },
    typography: {
      heading: 'Serif or elegant sans (Playfair Display, Lora, Gilroy)',
      body: 'Professional, readable (Inter, Work Sans)',
      avoid: 'Playful scripts, decorative fonts'
    },
    toneArchetype: 'Trusted financial advisor',
    toneKeywords: ['Trustworthy', 'Sophisticated', 'Secure', 'Strategic', 'Transparent'],
    copyPatterns: {
      ctaStyle: 'Value-focused ("Grow your wealth", "Secure your future")',
      avoidJargon: ['cheap', 'fast', 'easy'],
      useWords: ['strategic', 'optimized', 'secure', 'intelligent', 'wealth', 'growth']
    }
  },

  // ============================================================================
  // TAX & ACCOUNTING
  // ============================================================================
  'tax-prep': {
    colorPsychology: {
      primary: ['green', 'emerald', 'forest-green'],
      reasoning: 'Money saved, financial growth, positive outcome',
      accent: ['gold', 'orange'],
      accentReason: 'Refund association, urgency during tax season',
      avoid: ['red'],
      avoidReason: 'Associated with debt, errors, IRS penalties'
    },
    visualStyle: {
      borderRadius: '8px',
      shadows: 'subtle - trust through restraint',
      patterns: 'Grid-based (organized like tax forms)',
      iconStyle: 'outlined'
    },
    typography: {
      heading: 'Sans-serif, trustworthy (Inter, Work Sans, Roboto)',
      body: 'Highly readable (Open Sans, system fonts)',
      avoid: 'Playful scripts, decorative serifs - tax is serious'
    },
    toneArchetype: 'Expert neighbor who actually does your taxes',
    toneKeywords: ['Clear', 'Reassuring', 'No-nonsense', 'Time-saving', 'Expert'],
    copyPatterns: {
      ctaStyle: 'Time-based urgency ("File in 15 minutes", "Done before lunch")',
      avoidJargon: ['synergy', 'innovative', 'revolutionary', 'game-changing'],
      useWords: ['simple', 'fast', 'accurate', 'stress-free', 'no jargon']
    }
  },

  // ============================================================================
  // DEVELOPER TOOLS & SAAS
  // ============================================================================
  'dev-tools': {
    colorPsychology: {
      primary: ['purple', 'indigo', 'electric-blue', 'cyber-blue'],
      reasoning: 'Innovation, technical sophistication, modern tech',
      accent: ['neon-green', 'cyber-yellow', 'electric-pink'],
      accentReason: 'Terminal/IDE aesthetics developers recognize',
      avoid: ['pastels', 'warm-earth-tones'],
      avoidReason: 'Too soft for technical audience'
    },
    visualStyle: {
      borderRadius: '4px',
      shadows: 'none or colored (cyber aesthetic)',
      patterns: 'Code-inspired (monospace grids, syntax highlighting)',
      iconStyle: 'duo-tone'
    },
    typography: {
      heading: 'Mono or technical sans (Space Mono, Space Grotesk, JetBrains Mono)',
      body: 'Clean sans (Inter, System UI)',
      code: 'JetBrains Mono, Fira Code (MUST INCLUDE)',
      avoid: 'Serifs, decorative fonts'
    },
    toneArchetype: 'Expert peer (not teacher)',
    toneKeywords: ['Precise', 'No-BS', 'Powerful', 'For builders', 'Technical'],
    copyPatterns: {
      ctaStyle: 'Action-oriented ("Ship faster", "Build in seconds", "Deploy now")',
      canUseJargon: ['API', 'CLI', 'SDK', 'localhost', 'deploy', 'repo'],
      avoidJargon: ['user-friendly', 'easy', 'simple'],
      useWords: ['powerful', 'flexible', 'scalable', 'fast', 'efficient']
    }
  },

  // ============================================================================
  // FITNESS & WELLNESS
  // ============================================================================
  'fitness': {
    colorPsychology: {
      primary: ['orange', 'red', 'electric-coral', 'vibrant-red'],
      reasoning: 'Energy, motivation, action, transformation',
      accent: ['lime', 'yellow', 'electric-blue'],
      accentReason: 'High-energy highlights, achievement',
      avoid: ['grey', 'muted-tones'],
      avoidReason: 'Low energy, demotivating'
    },
    visualStyle: {
      borderRadius: '12-16px',
      shadows: 'strong - depth, impact, movement',
      patterns: 'Dynamic angles, movement lines, progress bars',
      iconStyle: 'solid'
    },
    typography: {
      heading: 'Bold sans or display (Montserrat Bold, Oswald, Bebas Neue)',
      body: 'Readable, energetic (Inter, Roboto)',
      avoid: 'Thin weights, elegant serifs, script fonts'
    },
    toneArchetype: 'Motivating coach',
    toneKeywords: ['Energetic', 'Motivating', 'Results-driven', 'Empowering', 'Bold'],
    copyPatterns: {
      ctaStyle: 'Challenge-based ("Start your transformation", "Crush your goals")',
      useWords: ['transform', 'achieve', 'unlock', 'crush', 'powerful', 'results'],
      energyLevel: 'HIGH'
    }
  },

  // ============================================================================
  // HEALTHCARE & MEDICAL
  // ============================================================================
  'healthcare': {
    colorPsychology: {
      primary: ['teal', 'medical-blue', 'calm-green'],
      reasoning: 'Trust, healing, cleanliness, professionalism',
      accent: ['soft-coral', 'warm-orange'],
      accentReason: 'Human warmth, care, compassion',
      avoid: ['red', 'black', 'dark-colors'],
      avoidReason: 'Emergency association, intimidating'
    },
    visualStyle: {
      borderRadius: '12px',
      shadows: 'soft, gentle elevation',
      patterns: 'Clean, organized, spacious (hospital-like clarity)',
      iconStyle: 'outlined'
    },
    typography: {
      heading: 'Clean sans-serif (Inter, Nunito, Open Sans)',
      body: 'Highly readable, accessible (Roboto, System fonts)',
      avoid: 'Condensed fonts, decorative styles'
    },
    toneArchetype: 'Caring expert',
    toneKeywords: ['Compassionate', 'Professional', 'Clear', 'Reassuring', 'Accessible'],
    copyPatterns: {
      ctaStyle: 'Care-focused ("Get the care you need", "Book your appointment")',
      useWords: ['care', 'health', 'support', 'expertise', 'compassionate'],
      avoidJargon: ['disrupt', 'innovate']
    }
  },

  // ============================================================================
  // ECOMMERCE & RETAIL
  // ============================================================================
  'ecommerce': {
    colorPsychology: {
      primary: ['vibrant-blue', 'purple', 'teal'],
      reasoning: 'Trust, modernity, shopping experience',
      accent: ['orange', 'red', 'yellow'],
      accentReason: 'Urgency, sales, call-to-action',
      avoid: ['dull-grays', 'brown'],
      avoidReason: 'Low conversion, not exciting'
    },
    visualStyle: {
      borderRadius: '8-12px',
      shadows: 'card-like elevation for product focus',
      patterns: 'Grid layouts, product cards, shopping-focused',
      iconStyle: 'outlined'
    },
    typography: {
      heading: 'Bold sans (Montserrat, Poppins, Inter)',
      body: 'Clean, scannable (Roboto, Open Sans)',
      avoid: 'Serif (unless luxury brand)'
    },
    toneArchetype: 'Helpful sales assistant',
    toneKeywords: ['Friendly', 'Helpful', 'Exciting', 'Value-driven', 'Accessible'],
    copyPatterns: {
      ctaStyle: 'Action + benefit ("Shop now and save", "Get yours today")',
      useWords: ['save', 'discover', 'shop', 'exclusive', 'limited'],
      energyLevel: 'MEDIUM'
    }
  },

  // ============================================================================
  // EDUCATION & LEARNING
  // ============================================================================
  'education': {
    colorPsychology: {
      primary: ['blue', 'teal', 'purple'],
      reasoning: 'Knowledge, growth, trust, intellectual',
      accent: ['orange', 'yellow', 'green'],
      accentReason: 'Achievement, progress, growth',
      avoid: ['red', 'aggressive-colors'],
      avoidReason: 'Stressful, intimidating to learners'
    },
    visualStyle: {
      borderRadius: '12px',
      shadows: 'soft, approachable',
      patterns: 'Organized, clear hierarchy, progress indicators',
      iconStyle: 'outlined'
    },
    typography: {
      heading: 'Friendly sans (Poppins, Nunito, Inter)',
      body: 'Highly readable (Open Sans, Roboto)',
      avoid: 'Intimidating serifs, condensed fonts'
    },
    toneArchetype: 'Encouraging mentor',
    toneKeywords: ['Encouraging', 'Clear', 'Accessible', 'Growth-focused', 'Supportive'],
    copyPatterns: {
      ctaStyle: 'Growth-oriented ("Start learning", "Unlock your potential")',
      useWords: ['learn', 'grow', 'master', 'discover', 'achieve'],
      energyLevel: 'MEDIUM'
    }
  },

  // ============================================================================
  // REAL ESTATE
  // ============================================================================
  'real-estate': {
    colorPsychology: {
      primary: ['navy', 'slate-blue', 'forest-green'],
      reasoning: 'Trust, investment, stability, premium',
      accent: ['gold', 'warm-orange'],
      accentReason: 'Luxury, home warmth',
      avoid: ['neon', 'aggressive-colors'],
      avoidReason: 'Not premium or trustworthy'
    },
    visualStyle: {
      borderRadius: '8px',
      shadows: 'elegant elevation',
      patterns: 'Photo-heavy, spacious layouts',
      iconStyle: 'outlined'
    },
    typography: {
      heading: 'Elegant serif or refined sans (Playfair, Cormorant, Montserrat)',
      body: 'Professional (Inter, Open Sans)',
      avoid: 'Casual, playful fonts'
    },
    toneArchetype: 'Trusted advisor',
    toneKeywords: ['Professional', 'Knowledgeable', 'Premium', 'Trustworthy', 'Local'],
    copyPatterns: {
      ctaStyle: 'Investment-focused ("Find your dream home", "Schedule a viewing")',
      useWords: ['home', 'investment', 'dream', 'community', 'premium']
    }
  },

  // ============================================================================
  // DEFAULT / SAAS
  // ============================================================================
  'default': {
    colorPsychology: {
      primary: ['blue', 'purple', 'teal'],
      reasoning: 'Trust, professionalism, modern',
      accent: ['orange', 'green'],
      accentReason: 'Action, growth'
    },
    visualStyle: {
      borderRadius: '8px',
      shadows: 'modern, subtle elevation',
      patterns: 'Clean, organized',
      iconStyle: 'outlined'
    },
    typography: {
      heading: 'Modern sans (Inter, Poppins)',
      body: 'Readable (Inter, Open Sans)',
      avoid: 'Decorative, script fonts'
    },
    toneArchetype: 'Professional expert',
    toneKeywords: ['Professional', 'Trustworthy', 'Modern', 'Efficient'],
    copyPatterns: {
      ctaStyle: 'Action-oriented ("Get started", "Learn more")',
      useWords: ['professional', 'efficient', 'modern', 'reliable']
    }
  }
};

/**
 * Detect industry from website facts and persona
 */
export function detectIndustry(facts: any, persona: any): string {
  const industry = persona?.industry?.toLowerCase() || '';
  const company = persona?.company?.toLowerCase() || '';
  const role = persona?.role?.toLowerCase() || '';
  const painPoints = persona?.painPoints?.join(' ').toLowerCase() || '';

  // Tax & Accounting
  if (
    industry.includes('tax') ||
    industry.includes('accounting') ||
    company.includes('tax') ||
    painPoints.includes('tax') ||
    painPoints.includes('filing')
  ) {
    return 'tax-prep';
  }

  // Developer Tools
  if (
    industry.includes('developer') ||
    industry.includes('dev tools') ||
    industry.includes('software development') ||
    role.includes('developer') ||
    role.includes('engineer') ||
    painPoints.includes('deploy') ||
    painPoints.includes('code') ||
    painPoints.includes('api')
  ) {
    return 'dev-tools';
  }

  // Finance
  if (
    industry.includes('finance') ||
    industry.includes('fintech') ||
    industry.includes('banking') ||
    industry.includes('investment') ||
    company.includes('bank') ||
    company.includes('capital')
  ) {
    return 'finance';
  }

  // Fitness
  if (
    industry.includes('fitness') ||
    industry.includes('wellness') ||
    industry.includes('health club') ||
    industry.includes('gym') ||
    painPoints.includes('workout') ||
    painPoints.includes('fitness')
  ) {
    return 'fitness';
  }

  // Healthcare
  if (
    industry.includes('healthcare') ||
    industry.includes('medical') ||
    industry.includes('clinic') ||
    industry.includes('hospital') ||
    role.includes('doctor') ||
    role.includes('nurse') ||
    role.includes('patient')
  ) {
    return 'healthcare';
  }

  // Ecommerce
  if (
    industry.includes('ecommerce') ||
    industry.includes('e-commerce') ||
    industry.includes('retail') ||
    industry.includes('online store') ||
    painPoints.includes('shop') ||
    painPoints.includes('product')
  ) {
    return 'ecommerce';
  }

  // Education
  if (
    industry.includes('education') ||
    industry.includes('learning') ||
    industry.includes('training') ||
    industry.includes('school') ||
    industry.includes('university') ||
    role.includes('student') ||
    role.includes('teacher')
  ) {
    return 'education';
  }

  // Real Estate
  if (
    industry.includes('real estate') ||
    industry.includes('property') ||
    industry.includes('housing') ||
    role.includes('realtor') ||
    role.includes('agent')
  ) {
    return 'real-estate';
  }

  // Default to SaaS
  return 'default';
}

/**
 * Get archetype by industry key
 */
export function getArchetype(industry: string): IndustryArchetype {
  return industryArchetypes[industry] || industryArchetypes['default'];
}

/**
 * Get suggested gradient mood based on industry archetype
 */
export function getSuggestedGradientMood(industry: string): 'energetic' | 'calm' | 'professional' | 'creative' | 'trustworthy' {
  const moodMap: Record<string, 'energetic' | 'calm' | 'professional' | 'creative' | 'trustworthy'> = {
    'fitness': 'energetic',
    'dev-tools': 'creative',
    'finance': 'trustworthy',
    'tax-prep': 'professional',
    'healthcare': 'calm',
    'ecommerce': 'energetic',
    'education': 'calm',
    'real-estate': 'professional',
    'default': 'professional'
  };

  return moodMap[industry] || 'professional';
}
