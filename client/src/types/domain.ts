export type DomainSupportStatus = 'supported' | 'partially_supported' | 'unsupported';

export interface DomainCapability {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: DomainSupportStatus;
  statusLabel: string;
  hasExecutionEngine: boolean;
  hasAdaptiveRoadmap: boolean;
  availableTracks?: string[];
  limitationReason?: string;
  recommendedAlternativeId?: string;
}

export interface DomainCapabilityResult {
  capability: DomainCapability;
  source: 'client_registry' | 'backend_api';
  backendCapabilityApiReady: boolean;
  disclaimer: string;
}

export interface DomainSelection {
  domainId: string;
  customDomainName?: string;
  capability: DomainCapability;
}
