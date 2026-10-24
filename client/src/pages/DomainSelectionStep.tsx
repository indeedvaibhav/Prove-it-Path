import React, { useState } from 'react';
import { Button } from '../components/Common/Button';
import { ArrowRightIcon, CheckIcon, AlertIcon } from '../components/Common/Icons';
import { KNOWN_DOMAINS, resolveDomainCapability } from '../lib/domainRegistry';
import { DomainCapability, DomainSelection } from '../types/domain';

interface DomainSelectionStepProps {
  initialDomainId?: string;
  initialCustomDomainName?: string;
  onContinue: (selection: DomainSelection) => void;
}

export const DomainSelectionStep: React.FC<DomainSelectionStepProps> = ({
  initialDomainId = 'sql',
  initialCustomDomainName = '',
  onContinue
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialDomainId);
  const [customInput, setCustomInput] = useState<string>(initialCustomDomainName);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(
    initialDomainId.startsWith('custom-') || Boolean(initialCustomDomainName)
  );

  // Resolve current active capability
  const activeResult = isCustomMode && customInput.trim()
    ? resolveDomainCapability(customInput.trim())
    : resolveDomainCapability(selectedId);

  const capability: DomainCapability = activeResult.capability;

  const handleSelectPredefined = (domainId: string) => {
    setIsCustomMode(false);
    setSelectedId(domainId);
  };

  const handleCustomInputFocus = () => {
    setIsCustomMode(true);
  };

  const handleSwitchToSql = () => {
    setIsCustomMode(false);
    setSelectedId('sql');
    setCustomInput('');
  };

  const handleProceed = () => {
    onContinue({
      domainId: capability.id,
      customDomainName: isCustomMode ? customInput.trim() : undefined,
      capability
    });
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%', padding: '3rem 1rem 2rem 1rem' }}>
      {/* Masthead */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span
          style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-subtle)',
            fontWeight: 700,
            display: 'block',
            marginBottom: '0.6rem'
          }}
        >
          Prove-It Path • Domain Selection
        </span>
        <h1
          style={{
            fontSize: '2.35rem',
            fontWeight: 700,
            margin: '0 0 0.75rem 0',
            lineHeight: 1.15,
            letterSpacing: '-0.02em'
          }}
        >
          Choose your learning domain
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.55
          }}
        >
          Prove-It Path diagnoses knowledge gaps using actual code execution. Select a supported field or suggest a topic of interest.
        </p>

        {/* Integration Dependency Notice */}
        <div
          style={{
            marginTop: '1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            color: 'var(--text-subtle)'
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Capability API:</span>
          <span>Client catalog mode (backend /api/capabilities pending). Real execution verified for Relational SQL.</span>
        </div>
      </div>

      {/* Domain Selection Grid */}
      <div
        role="radiogroup"
        aria-label="Available Learning Domains"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        {KNOWN_DOMAINS.map((domain) => {
          const isSelected = !isCustomMode && selectedId === domain.id;
          const isSupported = domain.status === 'supported';

          return (
            <div
              key={domain.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleSelectPredefined(domain.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectPredefined(domain.id);
                }
              }}
              style={{
                background: isSelected ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
                border: isSelected ? '2px solid var(--border-dark)' : '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '180px',
                transition: 'all 0.12s ease',
                boxShadow: isSelected ? 'var(--shadow-card)' : 'none'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSupported ? 'var(--color-success-bg)' : 'var(--color-slip-bg)',
                      color: isSupported ? 'var(--color-success)' : 'var(--color-slip)',
                      border: `1px solid ${isSupported ? 'var(--color-success-border)' : 'var(--color-slip-border)'}`
                    }}
                  >
                    {domain.statusLabel}
                  </span>

                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid var(--border-dark)' : '2px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? 'var(--border-dark)' : 'transparent',
                      color: '#ffffff'
                    }}
                  >
                    {isSelected && <CheckIcon size={11} color="#ffffff" />}
                  </div>
                </div>

                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>
                  {domain.name}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                  {domain.tagline}
                </p>
              </div>

              {isSupported && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 600 }}>
                  ✓ Real task execution active
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Domain Suggestion Box */}
      <div
        style={{
          background: isCustomMode ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
          border: isCustomMode ? '2px solid var(--border-dark)' : '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '2rem',
          boxShadow: isCustomMode ? 'var(--shadow-card)' : 'none',
          transition: 'all 0.12s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label
            htmlFor="custom-domain-input"
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-main)'
            }}
          >
            Or suggest a custom field of interest
          </label>
          {isCustomMode && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--color-gap)',
                background: 'var(--color-gap-bg)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-gap-border)'
              }}
            >
              Custom Suggestion
            </span>
          )}
        </div>

        <input
          id="custom-domain-input"
          type="text"
          value={customInput}
          onFocus={handleCustomInputFocus}
          onChange={(e) => {
            setIsCustomMode(true);
            setCustomInput(e.target.value);
          }}
          placeholder="e.g. Python data science, Docker containers, Rust concurrency, Distributed systems..."
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.95rem',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            color: 'var(--text-main)',
            outline: 'none'
          }}
        />
      </div>

      {/* Capability Assessment & Limitation Notice */}
      {capability.status !== 'supported' && (
        <div
          style={{
            background: capability.status === 'unsupported' ? 'var(--color-gap-bg)' : 'var(--color-slip-bg)',
            border: `1px solid ${capability.status === 'unsupported' ? 'var(--color-gap-border)' : 'var(--color-slip-border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ color: capability.status === 'unsupported' ? 'var(--color-gap)' : 'var(--color-slip)', marginTop: '0.1rem' }}>
              <AlertIcon size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text-main)' }}>
                {capability.status === 'unsupported'
                  ? `Interactive evaluation unavailable for "${capability.name}"`
                  : `Preview Mode: Interactive runner in development for "${capability.name}"`}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
                {capability.limitationReason}
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSwitchToSql}
                >
                  Switch to Relational SQL (Recommended)
                </Button>
                {capability.status === 'partially_supported' && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                    You can still explore the conceptual curriculum roadmap below.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <Button
          variant="primary"
          size="lg"
          onClick={handleProceed}
          disabled={isCustomMode && !customInput.trim()}
          icon={<ArrowRightIcon size={16} />}
        >
          {capability.status === 'supported'
            ? `Continue with ${capability.name}`
            : capability.status === 'partially_supported'
            ? `Preview ${capability.name} Roadmap`
            : `Save "${capability.name}" & Continue`}
        </Button>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          {capability.status === 'supported'
            ? 'Fully wired to real execution engine and contrast interventions.'
            : 'Interactive tasks will be limited until execution engine is wired.'}
        </span>
      </div>
    </div>
  );
};
