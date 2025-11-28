export type MFAStatus = 'disabled' | 'pending_verification' | 'enabled'

export interface MFAFactor {
  id: string
  type: 'totp'
  friendly_name?: string
  created_at: string
  updated_at: string
  status: 'unverified' | 'verified'
}

export interface MFAEnrollment {
  id: string
  type: 'totp'
  totp: {
    qr_code: string
    secret: string
    uri: string
  }
}

export interface MFAChallengeResponse {
  id: string
  type: 'totp'
  expires_at: number
}
