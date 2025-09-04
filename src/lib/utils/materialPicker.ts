import { materials } from '../../data/materials.json';

/**
 * Deterministic material picker using seed-based random generation
 * @param seed - String seed for deterministic results
 * @returns Material object with id, name, tier, etc.
 */
export function pickMaterial(seed: string) {
  // Simple hash function for deterministic randomness
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use absolute value and modulo to get positive number
  const random = Math.abs(hash) / 2147483648; // Normalize to 0-1
  
  // Calculate total weight
  const totalWeight = materials.reduce((sum, material) => sum + material.weight, 0);
  
  // Pick based on weighted random
  let weightedRandom = random * totalWeight;
  
  for (const material of materials) {
    weightedRandom -= material.weight;
    if (weightedRandom <= 0) {
      return material;
    }
  }
  
  // Fallback to first material (should never happen)
  return materials[0];
}

/**
 * Generate a deterministic hash from multiple components
 * @param seed - Base seed
 * @param component - Additional component (e.g., "PUNCH", "MATERIAL")
 * @returns Combined hash string
 */
export function hashSeed(seed: string, component: string): string {
  return `${seed}_${component}`;
}

/**
 * Get punch count (0-25) from seed
 * @param seed - String seed
 * @returns Number between 0 and 25
 */
export function getPunchCount(seed: string): number {
  const punchSeed = hashSeed(seed, "PUNCH");
  let hash = 0;
  for (let i = 0; i < punchSeed.length; i++) {
    const char = punchSeed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 26; // 0-25
}

/**
 * Generate a random seed string
 * @returns Random seed string
 */
export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}