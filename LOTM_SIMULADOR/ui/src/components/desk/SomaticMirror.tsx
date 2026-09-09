import React from 'react';
import { Eye, ShieldAlert, Anchor, Sparkles } from 'lucide-react';

interface SomaticMirrorProps {
  somatics: {
    sanityPercentage: number;
    sanityTier: string;
    corruptionPercentage: number;
    corruptionTier: string;
    corruptionNarrative: string;
    anchorsPercentage: number;
    anchorsTier: string;
  };
  pathwayInfo: {
    pathway: string;
    sequence: number;
    sequenceName: string;
    digestionPercentage: number;
    actingPrinciple?: string;
  };
}

export const SomaticMirror: React.FC<SomaticMirrorProps> = ({ somatics, pathwayInfo }) => {
  const isSanityLow = somatics.sanityPercentage < 50;
  const isCorruptionHigh = somatics.corruptionPercentage > 30;

  // Determinar el color y estado del aura somática
  const sanityColor = isSanityLow ? '#e11d48' : somatics.sanityPercentage < 75 ? '#f59e0b' : '#10b981';
  const corruptionColor = isCorruptionHigh ? '#c084fc' : '#9b6fe0';

  return (
    <div className={`card-frame ${isCorruptionHigh ? 'corruption-shimmer' : ''}`} style={{ padding: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={20} color={isSanityLow ? '#e11d48' : 'var(--gold)'} />
          <h3 style={{ fontSize: '1rem', color: 'var(--gold)' }}>El Espejo Somático</h3>
        </div>
        <span className="gold-badge" style={{ fontSize: '0.75rem' }}>
          {pathwayInfo.pathway} (S-{pathwayInfo.sequence})
        </span>
      </div>

      {/* Barra de Cordura */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
          <span style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldAlert size={14} color={sanityColor} /> Cordura & Lucidez:
          </span>
          <span style={{ color: sanityColor, fontWeight: 'bold' }}>
            {somatics.sanityPercentage}% ({somatics.sanityTier})
          </span>
        </div>
        <div style={{ height: '7px', background: '#252019', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.min(100, Math.max(0, somatics.sanityPercentage))}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${sanityColor}, #d4af37)`,
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* Barra de Digestión de Poción */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
          <span style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={14} color="var(--gold)" /> Digestión Astral:
          </span>
          <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>
            {pathwayInfo.digestionPercentage}%
          </span>
        </div>
        <div style={{ height: '7px', background: '#252019', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.min(100, Math.max(0, pathwayInfo.digestionPercentage))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #d4af37, #fef08a)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* Corrupción y Anclas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div style={{ background: '#191319', border: '1px solid #452145', padding: '8px', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.75rem', color: corruptionColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.85rem' }}>👁️</span> Corrupción: {somatics.corruptionPercentage}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#a89aa8', marginTop: '2px' }}>
            {somatics.corruptionTier}
          </div>
        </div>

        <div style={{ background: '#121915', border: '1px solid #20452e', padding: '8px', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Anchor size={12} /> Anclas: {somatics.anchorsPercentage}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9aa89f', marginTop: '2px' }}>
            {somatics.anchorsTier}
          </div>
        </div>
      </div>

      {/* Susurros y Ley de Actuación */}
      {pathwayInfo.actingPrinciple && (
        <div className="parchment-sheet" style={{ padding: '8px 10px', fontSize: '0.78rem', fontStyle: 'italic', borderLeft: '3px solid var(--gold)' }}>
          <strong>Ley de Actuación:</strong> "{pathwayInfo.actingPrinciple}"
        </div>
      )}

      {isSanityLow && (
        <div style={{ marginTop: '8px', padding: '6px 8px', background: 'rgba(133, 28, 34, 0.25)', border: '1px solid var(--crimson)', borderRadius: '3px', fontSize: '0.75rem', color: '#fda4af' }}>
          ⚠️ <em>Los ecos de la locura arañan tu percepción. Consume té de menta o descansa antes de aventurarte.</em>
        </div>
      )}
    </div>
  );
};

