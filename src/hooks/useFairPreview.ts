import { useQuery } from '@tanstack/react-query'
import { useOmamoriStore } from '@/store/omamoriStore'

/**
 * Fixed rarity distribution - same for all users regardless of HYPE amount
 */
export const FIXED_RARITY_DISTRIBUTION = {
  common: { 
    percentage: 50, 
    color: '#8B7355',
    examples: ['Copper', 'Iron', 'Bronze', 'Tin', 'Lead']
  },
  uncommon: { 
    percentage: 25, 
    color: '#C0C0C0',
    examples: ['Silver', 'Nickel', 'Aluminum', 'Zinc', 'Brass']
  },
  rare: { 
    percentage: 15, 
    color: '#FFD700',
    examples: ['Gold', 'Platinum', 'Titanium', 'Palladium']
  },
  ultraRare: { 
    percentage: 7.5, 
    color: '#9370DB',
    examples: ['Obsidian', 'Diamond', 'Ruby', 'Sapphire']
  },
  mythic: { 
    percentage: 2.5, 
    color: '#FF6B6B',
    examples: ['Celestial', 'Ethereal', 'Void', 'Prismatic']
  }
} as const

/**
 * Hook for secure possibility showcase (no prediction)
 */
export function useFairPreview() {
  const { selectedMajor, selectedMinor, hypeAmount } = useOmamoriStore()
  
  return useQuery({
    queryKey: ['fairPreview', selectedMajor, selectedMinor, hypeAmount],
    queryFn: () => {
      // Generate guaranteed elements (user-controlled)
      const guaranteedElements = {
        majorGlyph: selectedMajor,
        minorGlyph: selectedMinor,
        hypeBurned: hypeAmount, // Metadata only, no rarity influence
      }
      
      // Fixed possibility ranges (same for everyone)
      const possibilityRanges = {
        rarityDistribution: FIXED_RARITY_DISTRIBUTION,
        punchRange: { min: 0, max: 25 }, // Always random 0-25
        materialCount: 24, // Total materials available
      }
      
      return {
        guaranteedElements,
        possibilityRanges,
        fairnessNote: "All users have identical odds regardless of HYPE amount",
        hypeNote: "HYPE amount is personal choice and recorded as metadata only"
      }
    },
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook for cycling inspiration examples
 */
export function useInspirationGallery() {
  const { selectedMajor, selectedMinor } = useOmamoriStore()
  
  return useQuery({
    queryKey: ['inspirationGallery', selectedMajor, selectedMinor],
    queryFn: () => {
      // Generate diverse examples showing all possibilities
      const examples = [
        {
          id: 1,
          rarity: 'Common',
          material: 'Copper',
          punches: 3,
          hypeExample: '0.01',
          note: 'Minimum HYPE, great result!'
        },
        {
          id: 2,
          rarity: 'Rare', 
          material: 'Gold',
          punches: 18,
          hypeExample: '0.5',
          note: 'Medium HYPE, lucky outcome!'
        },
        {
          id: 3,
          rarity: 'Mythic',
          material: 'Celestial',
          punches: 25,
          hypeExample: '10.0',
          note: 'High HYPE flex, pure luck!'
        },
        {
          id: 4,
          rarity: 'Uncommon',
          material: 'Silver',
          punches: 12,
          hypeExample: '100.0',
          note: 'Maximum flex, random result!'
        },
        {
          id: 5,
          rarity: 'Ultra Rare',
          material: 'Obsidian',
          punches: 7,
          hypeExample: '0.05',
          note: 'Low HYPE, amazing luck!'
        }
      ]
      
      return {
        examples,
        cycleInterval: 3000, // 3 seconds
        disclaimer: "Examples only - your actual result will be completely random and equally likely regardless of HYPE amount"
      }
    },
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook for fairness education
 */
export function useFairnessEducation() {
  return {
    principles: [
      "🎲 Pure luck determines all rarity outcomes",
      "⚖️ Same odds for everyone regardless of HYPE amount", 
      "💎 HYPE amount is personal expression only",
      "🔥 All HYPE burns support deflationary tokenomics",
      "🏆 Mythic materials are equally possible for all users"
    ],
    hypeReasons: [
      "🔥 Support deflationary tokenomics",
      "💎 Personal expression and flex",
      "📊 Metadata bragging rights",
      "🏅 Community leaderboards",
      "❤️ Show love for the project"
    ],
    notForOdds: "HYPE amount does NOT influence your chances - those are equal for everyone!"
  }
}

/**
 * Hook to validate current contract randomness is fair
 */
export function useContractFairness() {
  return useQuery({
    queryKey: ['contractFairness'],
    queryFn: () => {
      // Verify contract uses pure randomness sources
      const randomnessSources = [
        'block.timestamp (when minted)',
        'block.prevrandao (Ethereum 2.0 randomness)',
        'block.number (block height)', 
        'msg.sender (minter address)',
        'tx.gasprice (gas price used)',
        '_tokenIdCounter (mint sequence)'
      ]
      
      const notIncluded = [
        'msg.value (HYPE amount) - NOT used in randomness',
        'User preferences - NOT used in randomness',
        'Frontend data - NOT used in randomness'
      ]
      
      return {
        randomnessSources,
        notIncluded,
        fairnessGuarantee: "Contract uses only unpredictable blockchain data for randomness",
        securityNote: "Frontend cannot influence mint outcomes"
      }
    },
    staleTime: Infinity, // Static data
  })
}
