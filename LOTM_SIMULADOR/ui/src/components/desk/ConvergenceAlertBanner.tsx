import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Shield,
  Zap,
  Sword
} from 'lucide-react';

interface IncidentResolutionOption {
  method: 'BLUFF_CIVILIAN' | 'MYSTICAL_EVASION' | 'SHADOW_NEUTRALIZATION';
  label: string;
  costOrRequirement: string;
  description: string;
}

interface ConvergenceIncident {
  id: string;
  type: 'NEIGHBORING_PATHWAY_ENCOUNTER' | 'INQUISITORIAL_CHECKPOINT' | 'ASTRAL_ANOMALY';
  title: string;
  description: string;
  district: string;
  severity: number;
  pathwayInvolved?: string;
  resolutionOptions: IncidentResolutionOption[];
  resolved: boolean;
}

interface ConvergenceAlertBannerProps {
  onRefreshState: () => void;
  onOpenNotice: (title: string, body: string) => void;
}

export const ConvergenceAlertBanner: React.FC<ConvergenceAlertBannerProps> = ({
  onRefreshState,
  onOpenNotice
}) => {
  const [incidents, setIncidents] = useState<ConvergenceIncident[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/convergence/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error('Error al consultar incidentes de convergencia:', err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleResolve = async (incidentId: string, method: string) => {
    setResolvingId(incidentId);
    try {
      const res = await fetch('/api/convergence/incidents/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId, method })
      });
      const data = await res.json();
      if (res.ok) {
        onOpenNotice(data.success ? 'Amenaza Evadida / Neutralizada' : 'Fallo en la Resolución', data.narrative);
        fetchIncidents();
        onRefreshState();
      }
    } catch {
      onOpenNotice('Error', 'Fallo al resolver el incidente.');
    } finally {
      setResolvingId(null);
    }
  };

  if (incidents.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {incidents.map((inc) => (
        <div
          key={inc.id}
          className="card-frame"
          style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #1c0e0e 0%, #150f14 100%)',
            borderColor: '#dc2626',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertOctagon size={20} color="#ef4444" />
              <strong style={{ color: '#fca5a5', fontSize: '0.98rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ⚠️ [INCIDENTE DE CONVERGENCIA ACTIVO]: {inc.title}
              </strong>
            </div>
            <span className="gold-badge" style={{ borderColor: '#ef4444', color: '#fca5a5', fontSize: '0.72rem' }}>
              Gravedad: {inc.severity}/10 • {inc.district}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '0.86rem', color: '#f3ebd8', lineHeight: 1.5 }}>
            {inc.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {inc.resolutionOptions.map((opt) => (
              <button
                key={opt.method}
                disabled={resolvingId === inc.id}
                onClick={() => handleResolve(inc.id, opt.method)}
                className="action-tab-btn"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  background: '#201314',
                  borderColor: opt.method === 'BLUFF_CIVILIAN' ? '#38bdf8' : opt.method === 'MYSTICAL_EVASION' ? '#a855f7' : '#ef4444',
                  gap: '4px',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {opt.method === 'BLUFF_CIVILIAN' && <Shield size={14} color="#38bdf8" />}
                  {opt.method === 'MYSTICAL_EVASION' && <Zap size={14} color="#a855f7" />}
                  {opt.method === 'SHADOW_NEUTRALIZATION' && <Sword size={14} color="#ef4444" />}
                  <strong style={{ fontSize: '0.82rem', color: '#f3ebd8' }}>{opt.label}</strong>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#a89c89' }}>
                  {opt.description}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--gold)', marginTop: '2px' }}>
                  Requisito: {opt.costOrRequirement}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

