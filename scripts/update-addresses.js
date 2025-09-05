#!/usr/bin/env node

/**
 * Update contract addresses in frontend integration files
 * Usage: node scripts/update-addresses.js <materials> <render> <nft>
 */

const fs = require('fs')
const path = require('path')

function updateAddresses(materialsAddress, renderAddress, nftAddress) {
  console.log('Updating contract addresses...')
  console.log('Materials:', materialsAddress)
  console.log('Render:', renderAddress)
  console.log('NFT:', nftAddress)
  
  // Update abis/addresses.json
  const addressesPath = path.join(__dirname, '../abis/addresses.json')
  const addresses = {
    "999": {
      "MaterialRegistryPalette": materialsAddress,
      "OmamoriRender": renderAddress,
      "OmamoriNFT": nftAddress
    }
  }
  
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2))
  console.log('✓ Updated abis/addresses.json')
  
  // Update frontend-integration/src/index.ts
  const indexPath = path.join(__dirname, '../frontend-integration/src/index.ts')
  let indexContent = fs.readFileSync(indexPath, 'utf8')
  
  indexContent = indexContent.replace(
    /MaterialRegistryPalette: '0x[0-9a-fA-F]{40}'/,
    `MaterialRegistryPalette: '${materialsAddress}'`
  )
  indexContent = indexContent.replace(
    /OmamoriRender: '0x[0-9a-fA-F]{40}'/,
    `OmamoriRender: '${renderAddress}'`
  )
  indexContent = indexContent.replace(
    /OmamoriNFT: '0x[0-9a-fA-F]{40}'/,
    `OmamoriNFT: '${nftAddress}'`
  )
  
  fs.writeFileSync(indexPath, indexContent)
  console.log('✓ Updated frontend-integration/src/index.ts')
  
  // Update wagmi.config.ts
  const wagmiPath = path.join(__dirname, '../wagmi.config.ts')
  let wagmiContent = fs.readFileSync(wagmiPath, 'utf8')
  
  wagmiContent = wagmiContent.replace(
    /MaterialRegistryPalette: {\s*999: '0x[0-9a-fA-F]{40}'/,
    `MaterialRegistryPalette: {\n          999: '${materialsAddress}'`
  )
  wagmiContent = wagmiContent.replace(
    /OmamoriRender: {\s*999: '0x[0-9a-fA-F]{40}'/,
    `OmamoriRender: {\n          999: '${renderAddress}'`
  )
  wagmiContent = wagmiContent.replace(
    /OmamoriNFT: {\s*999: '0x[0-9a-fA-F]{40}'/,
    `OmamoriNFT: {\n          999: '${nftAddress}'`
  )
  
  fs.writeFileSync(wagmiPath, wagmiContent)
  console.log('✓ Updated wagmi.config.ts')
  
  // Update frontend-integration wagmi config
  const frontendWagmiPath = path.join(__dirname, '../frontend-integration/wagmi.config.ts')
  let frontendWagmiContent = fs.readFileSync(frontendWagmiPath, 'utf8')
  
  frontendWagmiContent = frontendWagmiContent.replace(
    /MaterialRegistryPalette: {\s*999: '0x[0-9a-fA-F]{40}'/,
    `MaterialRegistryPalette: {\n          999: '${materialsAddress}'`
  )
  frontendWagmiContent = frontendWagmiContent.replace(
    /OmamoriRender: {\s*999: '0x[0-9a-fA-F]{40}'/,
    `OmamoriRender: {\n          999: '${renderAddress}'`
  )
  frontendWagmiContent = frontendWagmiContent.replace(
    /OmamoriNFT: {\s*999: '0x[0-9a-fA-F]{40}'/,
    `OmamoriNFT: {\n          999: '${nftAddress}'`
  )
  
  fs.writeFileSync(frontendWagmiPath, frontendWagmiContent)
  console.log('✓ Updated frontend-integration/wagmi.config.ts')
  
  console.log('\n✅ All addresses updated successfully!')
  console.log('\nNext steps:')
  console.log('1. Run `wagmi generate` to update TypeScript types')
  console.log('2. Build and publish the frontend integration package')
  console.log('3. Update the live frontend with new contract addresses')
}

// Validate Ethereum addresses
function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length !== 3) {
    console.error('Usage: node scripts/update-addresses.js <materials> <render> <nft>')
    console.error('Example: node scripts/update-addresses.js 0x123... 0x456... 0x789...')
    process.exit(1)
  }
  
  const [materials, render, nft] = args
  
  if (!isValidAddress(materials) || !isValidAddress(render) || !isValidAddress(nft)) {
    console.error('Error: All addresses must be valid Ethereum addresses (0x + 40 hex chars)')
    process.exit(1)
  }
  
  updateAddresses(materials, render, nft)
}

module.exports = { updateAddresses }
