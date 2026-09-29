import React, { useState, useEffect } from 'react';
import {
  User,
  Church,
  Flame,
  Plus,
  Coins,
  CheckCircle,
  Home
} from 'lucide-react';

interface PersonaProfile {
  id: string;
  legalName: string;
  socialClass: 'WORKING_CLASS' | 'MIDDLE_CLASS' | 'ARISTOCRAT' | 'UNDERWORLD_OUTLAW';
  residenceDistrict: string;
  residenceAddress?: string;
  registeredProfession: string;
  walletPounds: number;
  bankAccountPounds?: number;
  rentPerWeek?: number;
  churchAffiliation?: string;
  knownAssociates?: string[];
  churchSuspicion: number;
  policeSuspicion: number;
  humanAnchors: number;
  isUnderSurveillance: boolean;
  isExposed: boolean;
  isBurned?: boolean;
  safehouseGrade?: number;
  notes?: string;
}

interface PersonaDossierViewProps {
  onRefreshState: () => void;
  onOpenNotice: (title: string, body: string) => void;
}

export const PersonaDossierView: React.FC<PersonaDossierViewProps> = ({
  onRefreshState,
  onOpenNotice
}) => {
  const [personas, setPersonas] = useState<PersonaProfile[]>([]);
  const [activePersona, setActivePersona] = useState<PersonaProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal para Crear Identidad
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newProfession, setNewProfession] = useState<string>('Perito Calígrafo');
  const [newClass, setNewClass] = useState<'WORKING_CLASS' | 'MIDDLE_CLASS' | 'ARISTOCRAT' | 'UNDERWORLD_OUTLAW'>('MIDDLE_CLASS');
  const [newDistrict, setNewDistrict] = useState<string>('Backlund - Cherwood');
  const [newAddress, setNewAddress] = useState<string>('Calle Minsk 18');
  const [newChurch, setNewChurch] = useState<string>('CHURCH_OF_EVERNIGHT');

  // Modal para Quemar Identidad
  const [burnTarget, setBurnTarget] = useState<PersonaProfile | null>(null);
  const [burnMethod, setBurnMethod] = useState<'FATAL_FIRE' | 'UNSOLVED_DISAPPEARANCE' | 'FAKE_SUICIDE'>('FATAL_FIRE');

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/personas');
      if (res.ok) {
        const data = await res.json();
        setPersonas(data.personas || []);
        setActivePersona(data.activePersona || null);
      }
    } catch (err) {
      console.error('Error cargando identidades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleSwitchPersona = async (personaId: string) => {
    try {
      const res = await fetch('/api/personas/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onOpenNotice('Cambio de Cobertura Concluido', data.message);
        fetchPersonas();
        onRefreshState();
      } else {
        onOpenNotice('Impedimento de Identidad', data.message || 'No fue posible asumir esta cobertura.');
      }
    } catch {
      onOpenNotice('Error de Red', 'Fallo al comunicarse con el registro civil.');
    }
  };

  const handleAttendChurch = async (personaId: string) => {
    try {
      const res = await fetch('/api/personas/church', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onOpenNotice('Comunión Eclesiástica Concluida', data.message);
        fetchPersonas();
        onRefreshState();
      } else {
        onOpenNotice('Incidente en el Templo', data.message || 'La asistencia a misa generó sospechas.');
        fetchPersonas();
        onRefreshState();
      }
    } catch {
      onOpenNotice('Error', 'No fue posible asistir al templo.');
    }
  };

  const handlePayRent = async (personaId: string) => {
    try {
      const res = await fetch('/api/personas/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onOpenNotice('Arrendamiento Pagado', data.message);
        fetchPersonas();
        onRefreshState();
      } else {
        onOpenNotice('Aviso del Casero', data.message || 'Fondos insuficientes para cubrir el alquiler.');
      }
    } catch {
      onOpenNotice('Error', 'Fallo al abonar el alquiler.');
    }
  };

  const handleExecuteBurn = async () => {
    if (!burnTarget) return;
    try {
      const res = await fetch('/api/personas/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: burnTarget.id,
          causeOfDeath: burnMethod
        })
      });
      const data = await res.json();
      setBurnTarget(null);
      if (res.ok && data.success) {
        onOpenNotice('Cobertura Incinerada & Muerte Fingida', data.message);
        fetchPersonas();
        onRefreshState();
      } else {
        onOpenNotice('Error al Incinerar', data.message);
      }
    } catch {
      onOpenNotice('Error', 'Fallo al procesar la falsa muerte.');
    }
  };

  const handleCreatePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/personas/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legalName: newName,
          socialClass: newClass,
          registeredProfession: newProfession,
          residenceDistrict: newDistrict,
          residenceAddress: newAddress,
          churchAffiliation: newChurch,
          initialWalletPounds: newClass === 'ARISTOCRAT' ? 40 : newClass === 'MIDDLE_CLASS' ? 15 : 5
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowCreateModal(false);
        setNewName('');
        onOpenNotice('Registro Civil Aprobado', data.message);
        fetchPersonas();
        onRefreshState();
      } else {
        onOpenNotice('Solicitud Denegada en el Registro', data.message || 'Requisitos de fondos o contactos insuficientes.');
      }
    } catch {
      onOpenNotice('Error', 'Fallo al tramitar la nueva identidad.');
    }
  };

  const getClassBadgeColor = (sc: string) => {
    switch (sc) {
      case 'ARISTOCRAT': return '#f59e0b';
      case 'MIDDLE_CLASS': return '#38bdf8';
      case 'WORKING_CLASS': return '#a3e635';
      case 'UNDERWORLD_OUTLAW': return '#f43f5e';
      default: return '#cfc6b8';
    }
  };

  const getClassLabel = (sc: string) => {
    switch (sc) {
      case 'ARISTOCRAT': return 'Aristocracia & Alta Cuna (£100 + 2 Avales)';
      case 'MIDDLE_CLASS': return 'Clase Media & Profesional (£30 + 1 Aval)';
      case 'WORKING_CLASS': return 'Clase Obrera & Fábricas (£10 + 1 Aval)';
      case 'UNDERWORLD_OUTLAW': return 'Bajos Fondos & Clandestinidad (£15 + 1 Aval)';
      default: return sc;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Cabecera del Dossier */}
      <div className="card-frame" style={{ padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={22} color="var(--gold)" />
            <h2 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.2rem', margin: 0 }}>
              EXPEDIENTE DE TAPADERAS CIVILES & DOBLE VIDA
            </h2>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#cfc6b8', maxWidth: '780px', lineHeight: 1.4 }}>
            Un Beyonder sin cobertura humana es devorado por la locura o ejecutado por la Inquisición.
            Cada identidad posee su propia cartera física de libras, dirección de residencia, sospecha policial y afiliación parroquial.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="crimson-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '0.9rem' }}
        >
          <Plus size={16} />
          <span>Tramitar Nueva Cobertura Legal</span>
        </button>
      </div>

      {/* Cuadrícula de Identidades Registradas */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gold)' }}>
          Examinando timbres y sellos del Registro Civil de Loen...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
          {personas.map((p) => {
            const isActive = activePersona?.id === p.id;
            const isBurned = p.isBurned;

            return (
              <div
                key={p.id}
                className="card-frame"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: isBurned ? '#140e0e' : isActive ? '#241a12' : '#181410',
                  borderColor: isBurned ? '#7f1d1d' : isActive ? 'var(--gold)' : 'var(--card-border)',
                  position: 'relative',
                  filter: isBurned ? 'grayscale(0.6)' : 'none'
                }}
              >
                {/* Sello de Estado */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.72rem',
                        fontWeight: 'bold',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        background: '#282017',
                        color: getClassBadgeColor(p.socialClass),
                        border: `1px solid ${getClassBadgeColor(p.socialClass)}`
                      }}
                    >
                      {p.socialClass.replace('_', ' ')}
                    </span>
                    <h3 className="cinzel" style={{ color: isBurned ? '#ef4444' : '#f3ebd8', fontSize: '1.15rem', margin: '6px 0 2px 0' }}>
                      {p.legalName}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#c4b59a' }}>
                      {p.registeredProfession}
                    </div>
                  </div>

                  <div>
                    {isBurned ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.78rem', fontWeight: 'bold' }}>
                        <Flame size={14} /> INCINERADA
                      </span>
                    ) : isActive ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.78rem', fontWeight: 'bold' }}>
                        <CheckCircle size={14} /> ACTIVA EN CALLE
                      </span>
                    ) : (
                      <span style={{ color: '#a89c89', fontSize: '0.75rem' }}>
                        EN RESERVA
                      </span>
                    )}
                  </div>
                </div>

                {/* Datos de Vivienda y Finanzas Aisladas */}
                <div style={{ background: '#120f0d', padding: '10px 12px', borderRadius: '4px', border: '1px solid #2e241c', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cfc6b8' }}>
                    <Home size={14} color="#38bdf8" />
                    <span><strong>Vivienda:</strong> {p.residenceAddress || p.residenceDistrict}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a89c89' }}>
                    <span>Alquiler Semanal: £{p.rentPerWeek || 3} libras</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>
                      Fondos en Cartera: £{p.walletPounds}
                    </span>
                  </div>
                  {p.churchAffiliation && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a89c89' }}>
                      <Church size={14} color="#d8b4e2" />
                      <span>Parroquia: {p.churchAffiliation.replace('CHURCH_OF_', '')}</span>
                    </div>
                  )}
                </div>

                {/* Medidores de Sospecha */}
                {!isBurned && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#a89c89', marginBottom: '3px' }}>
                        <span>Policía / Yard:</span>
                        <strong style={{ color: p.policeSuspicion >= 50 ? '#ef4444' : '#f59e0b' }}>
                          {p.policeSuspicion}%
                        </strong>
                      </div>
                      <div style={{ height: '5px', background: '#251c14', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${p.policeSuspicion}%`,
                            height: '100%',
                            background: p.policeSuspicion >= 50 ? '#ef4444' : '#f59e0b'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#a89c89', marginBottom: '3px' }}>
                        <span>Inquisición Iglesia:</span>
                        <strong style={{ color: p.churchSuspicion >= 50 ? '#ef4444' : '#a855f7' }}>
                          {p.churchSuspicion}%
                        </strong>
                      </div>
                      <div style={{ height: '5px', background: '#251c14', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${p.churchSuspicion}%`,
                            height: '100%',
                            background: p.churchSuspicion >= 50 ? '#ef4444' : '#a855f7'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Botonera de Acciones */}
                {!isBurned && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginTop: '4px' }}>
                    {!isActive && (
                      <button
                        onClick={() => handleSwitchPersona(p.id)}
                        className="action-tab-btn"
                        style={{ padding: '7px 8px', fontSize: '0.78rem', justifyContent: 'center', gridColumn: 'span 2', borderColor: 'var(--gold)' }}
                      >
                        <User size={14} color="var(--gold)" />
                        <span>Asumir esta Cobertura</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleAttendChurch(p.id)}
                      className="action-tab-btn"
                      style={{ padding: '6px 8px', fontSize: '0.76rem', justifyContent: 'center' }}
                      title="Asistir al culto semanal (-12% sospecha eclesiástica, +6 cordura, +8 ancla)"
                    >
                      <Church size={14} color="#d8b4e2" />
                      <span>Ir a Misa</span>
                    </button>

                    <button
                      onClick={() => handlePayRent(p.id)}
                      className="action-tab-btn"
                      style={{ padding: '6px 8px', fontSize: '0.76rem', justifyContent: 'center' }}
                      title="Pagar alquiler semanal"
                    >
                      <Coins size={14} color="var(--gold)" />
                      <span>Pagar Renta (£{p.rentPerWeek || 3})</span>
                    </button>

                    <button
                      onClick={() => setBurnTarget(p)}
                      className="action-tab-btn"
                      style={{ padding: '6px 8px', fontSize: '0.76rem', justifyContent: 'center', gridColumn: 'span 2', borderColor: '#7f1d1d', color: '#f87171' }}
                      title="Destruir la identidad, simular defunción y borrar sospechas oficiales"
                    >
                      <Flame size={14} color="#ef4444" />
                      <span>Quemar Cobertura & Fingir Muerte</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Tramitar Nueva Cobertura Legal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="card-frame" style={{ maxWidth: '600px', width: '92%', padding: '24px', border: '2px solid var(--gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px', marginBottom: '16px' }}>
              <h3 className="cinzel" style={{ color: 'var(--gold)', margin: 0, fontSize: '1.2rem' }}>
                REGISTRO DE NUEVA IDENTIDAD CIVIL (REINO DE LOEN)
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="action-tab-btn" style={{ padding: '4px 8px' }}>✕</button>
            </div>

            <form onSubmit={handleCreatePersona} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#a89c89', marginBottom: '4px' }}>
                  Nombre y Apellido Legal en Loen:
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ej: Sherlock Moriarty, Arthur Pendelton..."
                  required
                  style={{ width: '100%', padding: '8px 12px', background: '#171410', border: '1px solid #3d3122', color: '#fff', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#a89c89', marginBottom: '4px' }}>
                  Ocupación Declarada:
                </label>
                <input
                  type="text"
                  value={newProfession}
                  onChange={e => setNewProfession(e.target.value)}
                  placeholder="Detective, Perito, Notario, Tenedor de Libros..."
                  required
                  style={{ width: '100%', padding: '8px 12px', background: '#171410', border: '1px solid #3d3122', color: '#fff', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#a89c89', marginBottom: '4px' }}>
                  Estrato Social y Requisitos de Adquisición:
                </label>
                <select
                  value={newClass}
                  onChange={e => setNewClass(e.target.value as any)}
                  style={{ width: '100%', padding: '8px 12px', background: '#171410', border: '1px solid #3d3122', color: '#fff', borderRadius: '4px' }}
                >
                  <option value="WORKING_CLASS">{getClassLabel('WORKING_CLASS')}</option>
                  <option value="MIDDLE_CLASS">{getClassLabel('MIDDLE_CLASS')}</option>
                  <option value="ARISTOCRAT">{getClassLabel('ARISTOCRAT')}</option>
                  <option value="UNDERWORLD_OUTLAW">{getClassLabel('UNDERWORLD_OUTLAW')}</option>
                </select>
                <div style={{ fontSize: '0.74rem', color: '#a89c89', marginTop: '4px' }}>
                  * El dinero cubre timbres fiscales y sobornos en el Registro Civil; los contactos avalan tu credibilidad y vivienda.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a89c89', marginBottom: '4px' }}>
                    Distrito de Residencia:
                  </label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={e => setNewDistrict(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: '#171410', border: '1px solid #3d3122', color: '#fff', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a89c89', marginBottom: '4px' }}>
                    Dirección de Vivienda / Pensión:
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={e => setNewAddress(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: '#171410', border: '1px solid #3d3122', color: '#fff', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#a89c89', marginBottom: '4px' }}>
                  Parroquia y Fe Declarada:
                </label>
                <select
                  value={newChurch}
                  onChange={e => setNewChurch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: '#171410', border: '1px solid #3d3122', color: '#fff', borderRadius: '4px' }}
                >
                  <option value="CHURCH_OF_EVERNIGHT">Iglesia de la Noche Eterna (Catedral de Santa Sofía)</option>
                  <option value="CHURCH_OF_STORMS">Iglesia del Señor de las Tormentas (Catedral del Viento Sagrado)</option>
                  <option value="CHURCH_OF_STEAM">Iglesia del Dios del Vapor y la Maquinaria</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="action-tab-btn">
                  Cancelar
                </button>
                <button type="submit" className="crimson-btn">
                  Pagar Timbres y Registrar Identidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quemar Cobertura y Fingir Muerte */}
      {burnTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="card-frame" style={{ maxWidth: '540px', width: '92%', padding: '24px', border: '2px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '12px' }}>
              <Flame size={24} />
              <h3 className="cinzel" style={{ margin: 0, fontSize: '1.2rem' }}>
                INCINERACIÓN DE COBERTURA & FALSA MUERTE
              </h3>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#f3ebd8', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              ¿Estás seguro de que deseas destruir permanentemente la identidad de <strong>{burnTarget.legalName}</strong>?
              Esta acción no se puede deshacer. Las autoridades policiales y eclesiásticas cerrarán las investigaciones abiertas,
              pero sufrirás tensión mental (-8 cordura) y se romperán las anclas humanas asociadas (-15 ancla).
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#a89c89', marginBottom: '6px' }}>
                Selecciona la Causa de Muerte Simulada (Se publicará en el Daily Observer):
              </label>
              <select
                value={burnMethod}
                onChange={e => setBurnMethod(e.target.value as any)}
                style={{ width: '100%', padding: '8px 12px', background: '#171410', border: '1px solid #7f1d1d', color: '#fff', borderRadius: '4px' }}
              >
                <option value="FATAL_FIRE">🔥 Incendio Nocturno en la Vivienda (Estufa Defectuosa)</option>
                <option value="UNSOLVED_DISAPPEARANCE">🌫️ Desaparición Inexplicable en las Nieblas del Río Tussock</option>
                <option value="FAKE_SUICIDE">📜 Suicidio Ficticio por Deudas Comerciales</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setBurnTarget(null)} className="action-tab-btn">
                Abortar
              </button>
              <button
                onClick={handleExecuteBurn}
                className="crimson-btn"
                style={{ background: '#7f1d1d', borderColor: '#ef4444' }}
              >
                Incinerar y Desaparecer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

