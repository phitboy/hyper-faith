import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [],
  plugins: [
    foundry({
      project: '.',
      artifacts: 'out/',
      include: [
        'MaterialRegistryPalette.sol/**',
        'OmamoriRender.sol/**', 
        'OmamoriNFT.sol/**',
        'IMaterials.sol/**'
      ],
      deployments: {
        MaterialRegistryPalette: {
          999: '0x0000000000000000000000000000000000000000', // Update after deployment
        },
        OmamoriRender: {
          999: '0x0000000000000000000000000000000000000000', // Update after deployment
        },
        OmamoriNFT: {
          999: '0x0000000000000000000000000000000000000000', // Update after deployment
        },
      },
    }),
  ],
})
