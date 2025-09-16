#!/usr/bin/env python3

import os
from hyperliquid.exchange import Exchange
from hyperliquid.utils import constants
from eth_account import Account

def enable_big_blocks_v2():
    """Try enabling big blocks using Exchange class directly"""
    
    # Load private key from environment
    private_key = os.getenv('PRIVATE_KEY')
    if not private_key:
        print("❌ PRIVATE_KEY not found in environment")
        return False
    
    print(f"🔑 Private key loaded (length: {len(private_key)})")
    
    # Ensure proper format with 0x prefix
    if not private_key.startswith('0x'):
        private_key = '0x' + private_key
    
    try:
        # Create account from private key
        account = Account.from_key(private_key)
        address = account.address
        
        print("🔄 Enabling big blocks for address...")
        print(f"Address: {address}")
        
        # Try to initialize Exchange to see if it works
        try:
            exchange = Exchange(account, constants.MAINNET_API_URL)
            print(f"✅ Exchange initialized successfully for: {exchange.wallet.address}")
            
            # Use the built-in use_big_blocks method
            result = exchange.use_big_blocks(True)
            print("✅ Big blocks enabled!")
            print(f"Result: {result}")
            return True
            
        except Exception as e:
            print(f"❌ Exchange initialization failed: {e}")
            # Try manual approach if Exchange fails
            return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = enable_big_blocks_v2()
    exit(0 if success else 1)
