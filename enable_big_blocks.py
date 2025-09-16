#!/usr/bin/env python3

import os
import requests
import json
from hyperliquid.utils.signing import sign_l1_action
from eth_account import Account

def enable_big_blocks():
    """Enable big blocks for contract deployment using proper HyperLiquid SDK signing"""
    
    # Load private key from environment
    private_key = os.getenv('PRIVATE_KEY')
    if not private_key:
        print("❌ PRIVATE_KEY not found in environment")
        return False
    
    print(f"🔑 Private key loaded (length: {len(private_key)})")
    
    # Ensure proper format with 0x prefix for eth_account
    if not private_key.startswith('0x'):
        private_key = '0x' + private_key
    
    try:
        # Create account from private key (this is what Exchange expects)
        account = Account.from_key(private_key)
        address = account.address
        
        print("🔄 Enabling big blocks for address...")
        print(f"Address: {address}")
        
        # Create the action
        action = {
            "type": "evmUserModify",
            "usingBigBlocks": True
        }
        
        # Sign the action
        import time
        nonce = int(time.time() * 1000)  # Current timestamp in milliseconds
        expires_after = 60000  # 60 seconds
        signature = sign_l1_action(account, action, None, nonce, expires_after, True)
        
        # Submit to API
        payload = {
            "action": action,
            "nonce": nonce,
            "signature": signature
        }
        
        response = requests.post(
            "https://api.hyperliquid.xyz/exchange",
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload)
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Big blocks enabled successfully!")
            print(f"Result: {result}")
            return True
        else:
            print(f"❌ API error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
    except Exception as e:
        print(f"❌ Error enabling big blocks: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = enable_big_blocks()
    exit(0 if success else 1)
