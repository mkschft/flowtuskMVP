# Flowtusk Pitch Deck

A YC-style interactive pitch deck built with Next.js and our existing design system.

## 🎯 Overview

This pitch deck is completely isolated from the main app and lives in:
- **Route**: `/pitch`
- **Component**: `components/pitch-deck/PitchDeck.tsx`

## 🎨 Design Philosophy

- **YC-Style**: Big text, one concept per slide, minimal clutter
- **Brand-Aligned**: Uses Flowtusk's purple/pink/blue gradients
- **Component-Based**: Built with shadcn/ui (Card, Badge, Button)
- **Responsive**: Works on desktop and mobile

## 📊 Slide Structure

1. **Cover** - Brand + tagline + metadata
2. **Problem** - B2B funnel challenges for startups
3. **Gap** - Competitor comparison table
4. **Solution** - 5-step flow (URL → Personas → Templates)
5. **Before/After** - Workflow comparison + KONE case study
6. **MVP vs Vision** - Available today vs coming soon
7. **Market** - TAM/SAM/SOM + "Why Now"
8. **Traction** - €61K revenue, 150+ waitlist, 3 pilots
9. **CTA** - Call to action + contact info

## 🎮 Navigation

- **Arrow Keys**: ← Previous slide, → Next slide
- **Click Dots**: Jump to specific slide
- **Buttons**: Use on-screen prev/next buttons

## 🚀 Usage

### Development
```bash
npm run dev
# Navigate to http://localhost:3000/pitch
```

### Presentation Mode
1. Open `/pitch` route
2. Press F11 for fullscreen (most browsers)
3. Use arrow keys to navigate
4. Press Escape to exit fullscreen

## 🎨 Customization

All content is inline in the component. To edit:

1. Open `components/pitch-deck/PitchDeck.tsx`
2. Find the specific slide function (e.g., `ProblemSlide()`)
3. Edit the JSX content
4. Save and refresh

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Type-safe**: TypeScript

## 📝 Content Source

All copy is from: `FINAL-PITCH-DECK-STRATEGY.md`

## 🎯 Future Enhancements

- [ ] Export to PDF
- [ ] Presenter notes
- [ ] Timer/slide duration tracking
- [ ] Remote control (present from phone)
- [ ] Analytics (which slides get most time)
- [ ] Custom themes/brand colors per client

## 🐛 Troubleshooting

**Slides not advancing with arrow keys?**
- Make sure the window has focus (click anywhere on the slide)

**Gradients not showing?**
- Check that `globals.css` has the gradient utilities
- Verify Tailwind config includes gradient classes

**Layout broken on mobile?**
- The deck is optimized for desktop presentation
- Mobile support is best-effort (responsive grid breakpoints)

## 📚 Related Files

- `/app/pitch/page.tsx` - Route wrapper
- `/components/pitch-deck/PitchDeck.tsx` - Main component
- `/app/globals.css` - Brand gradients and custom styles

---

Built with ❤️ for Flowtusk pitch sessions

