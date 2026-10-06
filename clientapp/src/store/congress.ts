// Utilities
import { defineStore } from 'pinia'
import apiClient from '@/api/elysianClient'

// A saved bill, with the snapshot of Congress.gov data the server keeps for it.
export type TrackedBill = {
  billTrackingId: number,
  congress: number,
  billType: string,
  billNumber: number,
  title: string,
  introducedDate: string | null,
  originChamber: string | null,
  policyArea: string | null,
  sponsorBioguideId: string | null,
  sponsorName: string | null,
  sponsorParty: string | null,
  sponsorState: string | null,
  latestActionText: string | null,
  latestActionDate: string | null,
  lawNumber: string | null,
  hasUnseenActivity: boolean,
  lastViewedAt: string | null,
  notes: string | null,
  savedAt: string
}

// Congress, type and number identify a bill for good. The API mixes "hr" and "HR", so key on upper case.
export function billKey(congress: number | string, billType: string, billNumber: number | string): string {
  return `${congress}-${billType.toUpperCase()}-${billNumber}`
}

type State = {
  trackedBills: TrackedBill[],
  loaded: boolean,
  // Keys saved or removed on screen but not yet confirmed by the server.
  pendingSaves: string[],
  pendingRemoves: string[]
}

export const useCongressStore = defineStore('congress', {
  state: (): State => ({
    trackedBills: [],
    loaded: false,
    pendingSaves: [],
    pendingRemoves: []
  }),
  getters: {
    trackedKeys: (state: State) => new Set(state.trackedBills.map(b => billKey(b.congress, b.billType, b.billNumber))),
    isTracked(): (congress: number | string, billType: string, billNumber: number | string) => boolean {
      return (congress, billType, billNumber) => {
        const key = billKey(congress, billType, billNumber)
        if (this.pendingRemoves.includes(key)) return false
        return this.pendingSaves.includes(key) || this.trackedKeys.has(key)
      }
    },
    findTracked: (state: State) => (congress: number | string, billType: string, billNumber: number | string) => {
      const key = billKey(congress, billType, billNumber)
      return state.trackedBills.find(b => billKey(b.congress, b.billType, b.billNumber) === key)
    },
    unseenCount: (state: State) => state.trackedBills.filter(b => b.hasUnseenActivity).length
  },
  actions: {
    async fetchTrackedBills(): Promise<void> {
      const response = await apiClient.getData('/api/CongressTrackedBills')
      if (!response?.success) {
        console.error("Failed to get saved bills.")
        return
      }
      this.trackedBills = response.data
      this.loaded = true
    },
    // Shows the bill as saved right away, and undoes that if the server says no.
    async trackBill(congress: number | string, billType: string, billNumber: number | string): Promise<boolean> {
      const key = billKey(congress, billType, billNumber)
      this.pendingSaves.push(key)
      try {
        const response = await apiClient.postData('/api/CongressTrackBill', {
          congress: Number(congress),
          billType: billType.toUpperCase(),
          billNumber: Number(billNumber)
        })
        if (!response?.success) {
          console.error("Failed to save bill.", response?.errorMessage)
          return false
        }
        if (!this.trackedKeys.has(key)) {
          this.trackedBills.unshift(response.data)
        }
        return true
      } finally {
        this.pendingSaves = this.pendingSaves.filter(k => k !== key)
      }
    },
    async untrackBill(congress: number | string, billType: string, billNumber: number | string): Promise<boolean> {
      const key = billKey(congress, billType, billNumber)
      this.pendingRemoves.push(key)
      try {
        const response = await apiClient.postData('/api/CongressUntrackBill', {
          congress: Number(congress),
          billType: billType.toUpperCase(),
          billNumber: Number(billNumber)
        })
        if (!response?.success) {
          console.error("Failed to remove saved bill.", response?.errorMessage)
          return false
        }
        this.trackedBills = this.trackedBills.filter(b => billKey(b.congress, b.billType, b.billNumber) !== key)
        return true
      } finally {
        this.pendingRemoves = this.pendingRemoves.filter(k => k !== key)
      }
    },
    async toggleTracked(congress: number | string, billType: string, billNumber: number | string): Promise<boolean> {
      return this.isTracked(congress, billType, billNumber)
        ? this.untrackBill(congress, billType, billNumber)
        : this.trackBill(congress, billType, billNumber)
    },
    async saveNotes(billTrackingId: number, notes: string): Promise<boolean> {
      const response = await apiClient.postData('/api/CongressSaveTrackedBillNotes', { billTrackingId, notes })
      if (!response?.success) {
        console.error("Failed to save notes.", response?.errorMessage)
        return false
      }
      const index = this.trackedBills.findIndex(b => b.billTrackingId === billTrackingId)
      if (index >= 0) {
        this.trackedBills[index] = response.data
      }
      return true
    },
    // Clears the new activity flag once the reader has opened the bill.
    async markViewed(billTrackingId: number): Promise<void> {
      const response = await apiClient.postData(`/api/CongressMarkTrackedBillViewed?billTrackingId=${billTrackingId}`, null)
      if (!response?.success) {
        console.error("Failed to mark saved bill viewed.")
        return
      }
      const bill = this.trackedBills.find(b => b.billTrackingId === billTrackingId)
      if (bill) {
        bill.hasUnseenActivity = false
        bill.lastViewedAt = new Date().toISOString()
      }
    }
  }
})
