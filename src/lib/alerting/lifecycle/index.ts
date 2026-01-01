/**
 * TokenTRA Alerting Engine - Lifecycle Index
 * 
 * Exports lifecycle management and deduplication modules.
 */

export {
  acknowledgeAlert,
  snoozeAlert,
  resolveAlert,
  checkAutoResolution,
  processSnoozedAlerts,
  getAlertTimeline,
} from "./manager";

export type { SnoozeDuration, ResolutionType } from "./manager";

export {
  isDuplicate,
  isInCooldown,
  isRateLimited,
  hasSimilarActiveAlert,
  recordAlert,
  isRuleActive,
} from "./deduplicator";
