

export const GlobalStatus = {
  Pending: 'pending',
  Active: 'active',
  Inactive: 'inactive',
  Deleted: 'deleted',
  EmailVerificationPending: 'email_verification_pending',
  Cancelled: 'cancelled',
  Closed: 'closed',
  Expired: 'expired',
  Busy: 'busy',
  Sent: 'sent',
  Available: 'available',
  ProfilePending: 'profile_pending',
  PasswordResetRequired: 'password_reset_required',
  Inherit: 'inherit',
  Payed: 'payed',
  Approved: 'approved',
  Deny: 'deny',
  Default: 'default',
  Scheduled: 'scheduled',
  Done: 'done',
  OfflineSale: 'offline_sale',
  Upgraded: 'upgraded',
  Disassembled: 'disassembled',
  Locked: 'locked',
  Failed: 'failed',
  Disabled: 'disabled',
  PartiallySent: 'partially_sent',
  Readed: 'readed',
  Authorized: 'authorized',
  Finished: 'finished',
  Coming: 'coming',
  Reported: 'reported',
  Archived: 'archived',
  Accepted: 'accepted',
  Completed: 'completed',
  Success: 'success',
  Detected: 'detected',
  Notified: 'notified',
  Discarded: 'discarded',
  Running: 'running',
} as const;

export const GlobalPersonType = {
  Legal: 'legal',
  Natural: 'natural',
  Application: 'application',
} as const;

export const GlobalPolicy = {
  Allow: 'allow',
  Deny: 'deny',
} as const;

export const GlobalSellerType = {
  Private: 'private',
  Dealer: 'dealer',
  Unknown: 'unknown',
} as const;


export const GlobalVisibilityType = { Public: 'public', Private: 'private' } as const;

