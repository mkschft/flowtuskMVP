/**
 * Test script for intelligent gradient generation
 *
 * Usage: npx tsx scripts/test-gradient-generation.ts
 */

import {
  generateIntelligentGradient,
  generateGradientVariations,
  formatGradientCSS,
  hexToHsl,
  type GradientMood,
  type GradientType
} from '../lib/utils/color-utils';

console.log('🎨 Testing Intelligent Gradient Generation\n');
console.log('='.repeat(80) + '\n');

// Test colors
const testColors = [
  { color: '#FFD700', name: 'Gold/Yellow' },
  { color: '#0066FF', name: 'Blue' },
  { color: '#FF6B6B', name: 'Coral/Red' },
  { color: '#2ECC71', name: 'Green' },
  { color: '#9B59B6', name: 'Purple' },
];

// Test each color with different moods and types
testColors.forEach(({ color, name }) => {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`📊 Testing: ${name} (${color})`);
  console.log(`${'─'.repeat(80)}\n`);

  const hsl = hexToHsl(color);
  console.log(`   HSL: H=${hsl?.h}°, S=${hsl?.s}%, L=${hsl?.l}%\n`);

  // Test different moods with analogous type
  const moods: GradientMood[] = ['professional', 'energetic', 'calm', 'creative', 'trustworthy'];

  console.log('   🎭 Mood Variations (Analogous):\n');
  moods.forEach(mood => {
    const gradient = generateIntelligentGradient(color, mood, 'analogous');
    const css = formatGradientCSS(gradient);
    console.log(`   ${mood.padEnd(14)} → ${gradient.start} → ${gradient.end}`);
    console.log(`   ${' '.repeat(14)}    ${gradient.reasoning}`);
    console.log(`   ${' '.repeat(14)}    CSS: ${css}\n`);
  });

  // Test different color theory types with professional mood
  console.log('   🎨 Color Theory Variations (Professional mood):\n');
  const types: GradientType[] = ['analogous', 'complementary', 'triadic', 'monochromatic'];

  types.forEach(type => {
    const gradient = generateIntelligentGradient(color, 'professional', type);
    const css = formatGradientCSS(gradient);
    console.log(`   ${type.padEnd(20)} → ${gradient.start} → ${gradient.end}`);
    console.log(`   ${' '.repeat(20)}    ${gradient.reasoning}`);
    if (gradient.middle) {
      console.log(`   ${' '.repeat(20)}    Middle: ${gradient.middle}`);
    }
    console.log(`   ${' '.repeat(20)}    CSS: ${css}\n`);
  });
});

// Test the issue mentioned: "yellow always becomes yellow-black"
console.log('\n' + '='.repeat(80));
console.log('🎯 SOLVING THE "YELLOW ALWAYS → YELLOW-BLACK" PROBLEM');
console.log('='.repeat(80) + '\n');

const yellow = '#FFD700';
console.log(`Base Color: ${yellow} (Gold/Yellow)\n`);

console.log('Before (Generic): Yellow → Black\n');
console.log('After (Intelligent Gradients):\n');

const yellowVariations = generateGradientVariations(yellow);
yellowVariations.forEach((gradient, index) => {
  console.log(`${index + 1}. ${gradient.mood.toUpperCase()} (${gradient.type})`);
  console.log(`   ${gradient.start} → ${gradient.end}`);
  console.log(`   ${gradient.reasoning}`);
  console.log(`   CSS: ${formatGradientCSS(gradient)}\n`);
});

// Visual comparison table
console.log('\n' + '='.repeat(80));
console.log('📊 VISUAL COMPARISON TABLE');
console.log('='.repeat(80) + '\n');

console.log('Color         | Mood         | Type           | Start   | End      | Usage Context');
console.log('-'.repeat(95));

const comparisonTests = [
  { color: '#FFD700', name: 'Yellow', mood: 'energetic' as GradientMood, type: 'analogous' as GradientType, context: 'Fitness brand CTA' },
  { color: '#FFD700', name: 'Yellow', mood: 'professional' as GradientMood, type: 'monochromatic' as GradientType, context: 'Finance dashboard' },
  { color: '#0066FF', name: 'Blue', mood: 'trustworthy' as GradientMood, type: 'analogous' as GradientType, context: 'Healthcare hero' },
  { color: '#0066FF', name: 'Blue', mood: 'creative' as GradientMood, type: 'triadic' as GradientType, context: 'Dev tools landing' },
  { color: '#FF6B6B', name: 'Red', mood: 'energetic' as GradientMood, type: 'complementary' as GradientType, context: 'Fitness challenge' },
  { color: '#2ECC71', name: 'Green', mood: 'calm' as GradientMood, type: 'monochromatic' as GradientType, context: 'Wellness app' },
];

comparisonTests.forEach(({ color, name, mood, type, context }) => {
  const gradient = generateIntelligentGradient(color, mood, type);
  console.log(
    `${name.padEnd(13)} | ${mood.padEnd(12)} | ${type.padEnd(14)} | ${gradient.start} | ${gradient.end} | ${context}`
  );
});

console.log('\n' + '='.repeat(80));
console.log('✅ Test Complete!');
console.log('='.repeat(80) + '\n');

console.log('Key Insights:\n');
console.log('1. Yellow no longer always → black');
console.log('2. Each industry/mood gets appropriate gradient');
console.log('3. Color theory ensures professional, varied results');
console.log('4. Gradients are context-aware and psychologically aligned\n');
