# Omamori NFT Supabase Edge Functions

This directory contains Supabase Edge Functions for rendering high-quality SVG art and metadata for Omamori NFTs off-chain.

## 🏗️ Architecture

```
supabase/
├── functions/
│   ├── _shared/
│   │   └── renderer.ts      # Shared SVG rendering logic
│   ├── render/
│   │   └── index.ts         # SVG rendering endpoint
│   ├── metadata/
│   │   └── index.ts         # Token metadata endpoint
│   └── health/
│       └── index.ts         # Health check endpoint
├── config.toml              # Supabase configuration
└── README.md               # This file
```

## 🚀 Deployment

### Prerequisites

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Create a new Supabase project** (or use existing):
   - Go to [app.supabase.com](https://app.supabase.com)
   - Create new project
   - Note your project reference ID

### Deploy Functions

1. **Run the deployment script:**
   ```bash
   SUPABASE_PROJECT_REF=your-project-ref ./deploy-supabase.sh
   ```

2. **Set environment variables** in Supabase Dashboard:
   - Go to `Project Settings > Edge Functions`
   - Add environment variables:
     - `RPC_URL`: `https://rpc.hyperliquid.xyz/evm`
     - `CONTRACT_ADDRESS`: Your deployed contract address
     - `SUPABASE_URL`: Your Supabase project URL

### Test Deployment

```bash
# Health check
curl https://your-project.supabase.co/functions/v1/health

# Render SVG for token #1
curl https://your-project.supabase.co/functions/v1/render/1

# Get metadata for token #1
curl https://your-project.supabase.co/functions/v1/metadata/1
```

## 📡 API Endpoints

### `GET /functions/v1/render/{tokenId}`
Returns high-quality SVG art for the specified token ID.

**Response:**
- Content-Type: `image/svg+xml`
- Cache-Control: `public, max-age=31536000` (1 year)

### `GET /functions/v1/metadata/{tokenId}`
Returns JSON metadata for the specified token ID.

**Response:**
```json
{
  "name": "Omamori #1",
  "description": "Ancient talismans for modern traders...",
  "image": "https://your-project.supabase.co/functions/v1/render/1",
  "attributes": [
    {"trait_type": "Material", "value": "Gold"},
    {"trait_type": "Rarity Tier", "value": "Mythic"},
    {"trait_type": "Major", "value": "Leverage"},
    {"trait_type": "Minor", "value": "Margin"},
    {"trait_type": "Punch Count", "value": 15},
    {"trait_type": "HYPE Burned", "value": "1.0000"}
  ]
}
```

### `GET /functions/v1/health`
Returns health status of all services.

## 🔧 Configuration

### Environment Variables

Set these in your Supabase project dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `RPC_URL` | HyperEVM RPC endpoint | `https://rpc.hyperliquid.xyz/evm` |
| `CONTRACT_ADDRESS` | Deployed NFT contract address | `0x1234...` |
| `SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |

### CORS Configuration

The functions are configured to allow cross-origin requests from any domain. For production, you may want to restrict this to your frontend domain only.

## 🔗 Integration with Smart Contract

Update your smart contract's `baseTokenURI` to point to your Supabase functions:

```solidity
// In your contract's constructor or admin function
baseTokenURI = "https://your-project.supabase.co/functions/v1/render/";
```

## 🎨 Art Rendering

The SVG renderer creates high-quality, scalable vector graphics with:

- **Material-based color palettes** (24 different materials)
- **Complex major glyphs** (12 major arcanum)
- **Detailed minor glyphs** (48 minor aspects)
- **Dynamic punch layouts** (up to 25 punches with collision detection)
- **Responsive design** (1000x1400 viewBox, scales to any size)

## 📊 Performance

- **Cold start**: ~100-200ms
- **Warm execution**: ~10-50ms
- **Caching**: 1 year for SVGs, 5 minutes for metadata
- **Scalability**: Automatic scaling with Supabase Edge Functions

## 🔒 Security

- **CORS enabled** for frontend integration
- **Environment variables** for sensitive configuration
- **No database dependencies** (stateless functions)
- **Read-only blockchain interaction**

## 🛠️ Development

### Local Development

1. **Start Supabase locally:**
   ```bash
   supabase start
   ```

2. **Serve functions locally:**
   ```bash
   supabase functions serve --env-file supabase/.env.local
   ```

3. **Test locally:**
   ```bash
   curl http://localhost:54321/functions/v1/health
   ```

### Debugging

Check function logs in the Supabase dashboard or use:
```bash
supabase functions logs --project-ref your-project-ref
```

## 🚀 Lovable Integration

This setup integrates seamlessly with Lovable deployments:

1. **Deploy to Supabase** using the provided scripts
2. **Update your frontend** to use the Supabase function URLs
3. **Deploy frontend via Lovable** - it will automatically use the Supabase-hosted art renderer

## 📈 Monitoring

Monitor your functions via:
- **Supabase Dashboard**: Real-time metrics and logs
- **Health endpoint**: Automated health checks
- **Error tracking**: Built-in error logging and reporting

---

🎉 **Your Omamori NFT art renderer is now running on Supabase Edge Functions!**

