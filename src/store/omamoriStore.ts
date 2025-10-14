import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OmamoriToken } from '../lib/contracts/omamori';

interface OmamoriStore {
  // Wallet state
  isConnected: boolean;
  address?: `0x${string}`;
  chainId?: number;
  
  // Mint state
  selectedMajor: number;
  selectedMinor: number;
  hypeAmount: string;
  
  // Token state
  myTokens: OmamoriToken[];
  allTokens: OmamoriToken[];
  
  // Actions
  setWalletState: (connected: boolean, address?: `0x${string}`, chainId?: number) => void;
  setSelectedMajor: (majorId: number) => void;
  setSelectedMinor: (minorId: number) => void;
  setMintSelection: (majorId: number, minorId: number) => void;
  setHypeAmount: (amount: string) => void;
  addToken: (token: OmamoriToken) => void;
  removeToken: (tokenId: number) => void;
  setMyTokens: (tokens: OmamoriToken[]) => void;
  setAllTokens: (tokens: OmamoriToken[]) => void;
  reset: () => void;
}

export const useOmamoriStore = create<OmamoriStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      selectedMajor: 0,
      selectedMinor: 0,
      hypeAmount: '0.01',
      myTokens: [],
      allTokens: [],
      
      // Actions
      setWalletState: (connected, address, chainId) => {
        set({ isConnected: connected, address, chainId });
      },
      
      setSelectedMajor: (majorId) => {
        set({ selectedMajor: majorId });
      },
      
      setSelectedMinor: (minorId) => {
        set({ selectedMinor: minorId });
      },
      
      setMintSelection: (majorId, minorId) => {
        set({ selectedMajor: majorId, selectedMinor: minorId });
      },
      
      setHypeAmount: (amount) => {
        set({ hypeAmount: amount });
      },
      
      addToken: (token) => {
        set((state) => ({
          myTokens: [token, ...state.myTokens],
          allTokens: [token, ...state.allTokens]
        }));
      },
      
      removeToken: (tokenId) => {
        set((state) => ({
          myTokens: state.myTokens.filter(token => token.tokenId !== tokenId)
        }));
      },
      
      setMyTokens: (tokens) => {
        set({ myTokens: tokens });
      },
      
      setAllTokens: (tokens) => {
        set({ allTokens: tokens });
      },
      
      reset: () => {
        set({
          isConnected: false,
          address: undefined,
          chainId: undefined,
          selectedMajor: 0,
          selectedMinor: 0,
          hypeAmount: '0.01',
          myTokens: [],
          allTokens: []
        });
      }
    }),
    {
      name: 'omamori-store',
      partialize: (state) => ({
        selectedMajor: state.selectedMajor,
        selectedMinor: state.selectedMinor,
        hypeAmount: state.hypeAmount,
        myTokens: state.myTokens,
        allTokens: state.allTokens
      })
    }
  )
);