export {
  isConsentRequired,
  getRequiredConsents,
  checkConsentStatus,
  isConsentValid,
  createConsentRecord,
  revokeConsent,
  getConsentExpiryDate,
} from './consent-manager'

export type { ConsentType, ConsentRecord, ConsentStatus } from './consent-manager'
