/**
 * Avatar utility for generating gender-appropriate persona avatars using DiceBear
 */

// Common male first names (limited set for quick detection)
const MALE_NAMES = new Set([
  'james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'joseph',
  'thomas', 'charles', 'christopher', 'daniel', 'matthew', 'anthony', 'mark',
  'donald', 'steven', 'paul', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian',
  'george', 'edward', 'ronald', 'timothy', 'jason', 'jeffrey', 'ryan', 'jacob',
  'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry', 'justin', 'scott',
  'brandon', 'benjamin', 'samuel', 'raymond', 'gregory', 'frank', 'alexander',
  'patrick', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'jose', 'adam',
  'henry', 'nathan', 'douglas', 'zachary', 'peter', 'kyle', 'walter', 'ethan',
  'jeremy', 'harold', 'keith', 'christian', 'roger', 'noah', 'gerald', 'carl',
  'terry', 'sean', 'austin', 'arthur', 'lawrence', 'jesse', 'dylan', 'jordan',
  'bryan', 'billy', 'bruce', 'albert', 'willie', 'gabriel', 'logan', 'alan',
  'juan', 'wayne', 'roy', 'ralph', 'eugene', 'randy', 'vincent', 'russell',
  'alex', 'max', 'marcus', 'derek', 'evan', 'lucas', 'connor', 'mason', 'luke'
]);

// Common female first names (limited set for quick detection)
const FEMALE_NAMES = new Set([
  'mary', 'patricia', 'jennifer', 'linda', 'barbara', 'elizabeth', 'susan',
  'jessica', 'sarah', 'karen', 'nancy', 'lisa', 'betty', 'margaret', 'sandra',
  'ashley', 'kimberly', 'emily', 'donna', 'michelle', 'dorothy', 'carol',
  'amanda', 'melissa', 'deborah', 'stephanie', 'rebecca', 'sharon', 'laura',
  'cynthia', 'kathleen', 'amy', 'angela', 'shirley', 'anna', 'brenda', 'pamela',
  'emma', 'nicole', 'helen', 'samantha', 'katherine', 'christine', 'debra',
  'rachel', 'carolyn', 'janet', 'catherine', 'maria', 'heather', 'diane',
  'ruth', 'julie', 'olivia', 'joyce', 'virginia', 'victoria', 'kelly', 'lauren',
  'christina', 'joan', 'evelyn', 'judith', 'megan', 'andrea', 'cheryl', 'hannah',
  'jacqueline', 'martha', 'gloria', 'teresa', 'ann', 'sara', 'madison', 'frances',
  'kathryn', 'janice', 'jean', 'abigail', 'alice', 'judy', 'sophia', 'grace',
  'denise', 'amber', 'doris', 'marilyn', 'danielle', 'beverly', 'isabella',
  'theresa', 'diana', 'natalie', 'brittany', 'charlotte', 'marie', 'kayla'
]);

type Gender = 'male' | 'female' | 'neutral';

/**
 * Detects likely gender from a first name
 */
function detectGenderFromName(name: string): Gender {
  const firstName = name.trim().split(/\s+/)[0].toLowerCase();

  if (MALE_NAMES.has(firstName)) {
    return 'male';
  }

  if (FEMALE_NAMES.has(firstName)) {
    return 'female';
  }

  return 'neutral';
}

/**
 * Generates a DiceBear avatar URL with gender-appropriate styling
 *
 * @param personaName - The persona's full name
 * @param style - DiceBear style to use (default: 'open-peeps')
 * @returns URL for the avatar
 */
export function getPersonaAvatarUrl(
  personaName: string,
  style: 'open-peeps' | 'notionists' | 'avataaars' = 'open-peeps'
): string {
  const gender = detectGenderFromName(personaName);
  const seed = encodeURIComponent(personaName);

  const baseUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;

  // Configure gender-specific options based on style
  if (style === 'open-peeps') {
    // Open Peeps doesn't have explicit gender param, but we can influence it with options
    const params = new URLSearchParams({
      seed: personaName,
      backgroundColor: 'transparent',
      // Use flip parameter to add variety while keeping gender consistent
      ...(gender === 'male' ? { flip: 'false' } : {}),
      ...(gender === 'female' ? { flip: 'true' } : {})
    });

    return `https://api.dicebear.com/7.x/open-peeps/svg?${params.toString()}`;
  }

  if (style === 'notionists') {
    // Notionists style - clean and professional, works well for business personas
    const bgColors = 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf';
    return `${baseUrl}&backgroundColor=${bgColors}`;
  }

  if (style === 'avataaars') {
    // Avataaars has more customization - not using gender param as it's deprecated
    return baseUrl;
  }

  return baseUrl;
}

/**
 * Gets a consistent avatar URL for a persona across the app
 * Uses the notionists style which is professional and gender-neutral
 *
 * @param personaName - The persona's full name
 * @returns URL for the avatar
 */
export function getPersonaAvatar(personaName: string): string {
  return getPersonaAvatarUrl(personaName, 'notionists');
}
