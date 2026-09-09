import React, { useState } from 'react';
import { BookOpen, AlertCircle, CheckCircle2, Flame, FlaskConical, Sparkles, Check } from 'lucide-react';

interface Ingredient {
  name: string;
  quantity?: string;
  acquired?: boolean;
}

interface FormulaDetails {
  sequenceName: string;
  sequenceNumber: number;
  potionAppearance?: string;
  mainIngredients: (string | Ingredient)[];
  supplementaryIngredients?: (string | Ingredient)[];
  ritualDescription?: string;
  actingPrinciples?: string[];
  characteristicAppearance?: string;
  isRitualSatisfied?: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  weight?: number;
  quantity?: number;
  description?: string;
}

interface CanonicalGrimoireProps {
  pathwayName: string;
  currentSequence: number;
  digestionPercentage: number;
  formula: FormulaDetails;
  inventoryItems?: InventoryItem[];
  onAdvanceSequence: () => Promise<any>;
  onBrewPotion?: (targetSequence: number, ingredientIds: string[]) => Promise<any>;
}

export const CanonicalGrimoire: React.FC<CanonicalGrimoireProps> = ({
  pathwayName,
  currentSequence,
  digestionPercentage,
  formula,
  inventoryItems = [],
  onAdvanceSequence,
  onBrewPotion
}) => {
  const isDigested = digestionPercentage >= 95;
  const targetSeq = formula.sequenceNumber !== undefined ? formula.sequenceNumber : Math.max(0, currentSequence - 1);
  const targetSeqName = formula.sequenceName || `Secuencia ${targetSeq}`;

  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);

  const normalizedMainIngredients = (formula.mainIngredients || []).map(ing => {
    if (typeof ing === 'string') {
      return { name: ing, acquired: false };
    }
    return ing;
  });

  const normalizedSuppIngredients = (formula.supplementaryIngredients || []).map(ing => {
    if (typeof ing === 'string') {
      return { name: ing, acquired: false };
    }
    return ing;
  });

  // Comprobar si el jugador ya tiene la poción preparada en el inventario
  const existingPotion = inventoryItems.find(i => 
    i.id === `POTION_${pathwayName}_${targetSeq}` || 
    (i.name.toLowerCase().includes('poción') && i.name.toLowerCase().includes(targetSeqName.toLowerCase()))
  );

  // Filtrar ingredientes potenciales en el inventario
  const availableIngredients = inventoryItems.filter(i => 
    i.type === 'INGREDIENT' || 
    i.name.toLowerCase().includes('cristal') ||
    i.name.toLowerCase().includes('ojo') ||
    i.name.toLowerCase().includes('sangre') ||
    i.name.toLowerCase().includes('raíz') ||
    i.name.toLowerCase().includes('agua') ||
    i.name.toLowerCase().includes('hierba') ||
    i.name.toLowerCase().includes('polvo') ||
    i.name.toLowerCase().includes('característica')
  );

  const toggleIngredientSelection = (id: string) => {
    setSelectedIngredientIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBrew = async () => {
    if (!onBrewPotion) return;
    setIsBrewing(true);
    try {
      await onBrewPotion(targetSeq, selectedIngredientIds);
      setSelectedIngredientIds([]);
    } finally {
      setIsBrewing(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Cabecera del Grimorio Arcano */}
      <div
        className="card-frame"
        style={{
          padding: '22px 26px',
          background: 'linear-gradient(180deg, #1d1813 0%, #100d0a 100%)',
          border: '2px solid var(--card-border-gold)',
          borderRadius: '8px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="brass-dial" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={24} color="var(--gold)" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#9e8c75', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Manuscrito Canónico de la Vía • Quinta Época
              </div>
              <h2 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.45rem' }}>
                GRIMORIO CANÓNICO: {pathwayName.toUpperCase()}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="gold-badge" style={{ fontSize: '0.85rem' }}>
              Rango Actual: Secuencia {currentSequence}
            </span>
            <span className="gold-badge" style={{ fontSize: '0.85rem', borderColor: isDigested ? '#10b981' : 'var(--gold)', color: isDigested ? '#34d399' : 'var(--gold)' }}>
              Digestión: {digestionPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Doble Página del Libro Ocultista */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
        {/* Página Izquierda: Fórmula y Requisitos de la Siguiente Secuencia */}
        <div className="parchment-sheet" style={{ padding: '24px', position: 'relative' }}>
          <div style={{ borderBottom: '2px solid #3d3122', paddingBottom: '8px', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.72rem', color: '#851c22', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              FÓRMULA CANÓNICA VERIFICADA
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#1a140e', fontWeight: 'bold' }}>
              Secuencia {targetSeq}: {targetSeqName}
            </h3>
          </div>

          {/* Ingredientes Principales */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#594430', textTransform: 'uppercase', marginBottom: '6px' }}>
              Ingredientes Principales (Características Extraordinarias):
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {normalizedMainIngredients.length > 0 ? (
                normalizedMainIngredients.map((ing, idx) => (
                  <div key={idx} style={{ fontSize: '0.84rem', color: '#2a2016', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.04)', padding: '6px 10px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#851c22', fontWeight: 'bold' }}>•</span>
                      <strong>{ing.name}</strong>
                    </div>
                    {ing.acquired ? (
                      <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Check size={13} /> En Posesión
                      </span>
                    ) : (
                      <span style={{ color: '#b91c1c', fontSize: '0.75rem', fontStyle: 'italic' }}>
                        Pendiente
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.82rem', fontStyle: 'italic', color: '#786854' }}>
                  [Tinta Borrosa - La fórmula de esta secuencia no ha sido descifrada aún.]
                </div>
              )}
            </div>
          </div>

          {/* Ingredientes Suplementarios */}
          {normalizedSuppIngredients.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#594430', textTransform: 'uppercase', marginBottom: '6px' }}>
                Ingredientes Secundarios (Estabilizadores Espirituales):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {normalizedSuppIngredients.map((supp, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', color: '#382e22', paddingLeft: '8px' }}>
                    - {supp.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apariencia de la Poción */}
          {formula.potionAppearance && (
            <div style={{ background: '#f5eee1', border: '1px solid #dcd1be', padding: '10px 12px', borderRadius: '4px', fontSize: '0.8rem', color: '#3d3224', fontStyle: 'italic', marginBottom: '14px' }}>
              <strong>Manifestación del Brebaje:</strong> "{formula.potionAppearance}"
            </div>
          )}

          {/* Requisito Ritual */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#851c22', textTransform: 'uppercase', marginBottom: '4px' }}>
              Ritual de Avance Obligatorio:
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#241c14', lineHeight: 1.45 }}>
              {formula.ritualDescription && formula.ritualDescription.trim().length > 0
                ? formula.ritualDescription
                : 'Ningún ritual sagrado es requerido para esta secuencia inicial. Basta con la digestión completa de la poción previa.'}
            </p>
          </div>
        </div>

        {/* Página Derecha: Mesa Alquímica & Caldero de Destilación */}
        <div className="card-frame" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#16120e' }}>
          <div>
            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '8px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                MESA ALQUÍMICA DIEGÉTICA
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#f3ebd8', fontWeight: 'bold' }}>
                El Caldero de Destilación
              </h3>
            </div>

            {/* Estado del Brebaje en Inventario */}
            {existingPotion ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '14px', borderRadius: '6px', marginBottom: '16px', textAlign: 'center' }}>
                <FlaskConical size={32} color="#34d399" style={{ margin: '0 auto 6px auto' }} />
                <div style={{ color: '#34d399', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  {existingPotion.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#a7f3d0', marginTop: '4px' }}>
                  El brebaje ha sido destilado y reposa en tu mochila listo para la ingesta.
                </div>
              </div>
            ) : (
              /* Selección de Ingredientes en Caldero */
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FlaskConical size={16} /> Cargar Materiales al Caldero:
                </div>

                {availableIngredients.length === 0 ? (
                  <div style={{ background: '#19140f', border: '1px dashed #544430', padding: '14px', borderRadius: '4px', textAlign: 'center', fontSize: '0.82rem', color: '#8c7d6b' }}>
                    No posees ingredientes místicos en tu mochila. Explora distritos o visita el mercado clandestino para conseguirlos.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                    {availableIngredients.map(item => {
                      const isSelected = selectedIngredientIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleIngredientSelection(item.id)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(212, 175, 55, 0.15)' : '#1b1712',
                            border: `1px solid ${isSelected ? 'var(--gold)' : '#3d3122'}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.85rem', color: isSelected ? 'var(--gold)' : '#e5ded2', fontWeight: isSelected ? 'bold' : 'normal' }}>
                              {item.name}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#8c7d6b', marginLeft: '6px' }}>x{item.quantity || 1}</span>
                          </div>
                          <span style={{ color: isSelected ? 'var(--gold)' : '#736452', fontSize: '0.8rem' }}>
                            {isSelected ? '✓ En Caldero' : '+ Añadir'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {onBrewPotion && !existingPotion && (
                  <button
                    onClick={handleBrew}
                    disabled={isBrewing || selectedIngredientIds.length === 0}
                    className="action-tab-btn"
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      justifyContent: 'center',
                      padding: '10px',
                      opacity: selectedIngredientIds.length === 0 ? 0.5 : 1
                    }}
                  >
                    <Sparkles size={16} />
                    <span>{isBrewing ? 'Destilando Brebaje...' : `Destilar Ingredientes (${selectedIngredientIds.length})`}</span>
                  </button>
                )}
              </div>
            )}

            {/* Checklist de Estabilidad Previa */}
            <div style={{ background: '#130f0c', border: '1px solid #332619', padding: '14px', borderRadius: '6px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Condiciones de Estabilidad del Beyonder:
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', marginBottom: '6px', color: isDigested ? '#34d399' : '#f59e0b' }}>
                {isDigested ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>Digestión Secuencia {currentSequence}: {digestionPercentage}% {isDigested ? '(Lista)' : '(Incompleta)'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: existingPotion ? '#34d399' : '#f87171' }}>
                {existingPotion ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>Poción de Secuencia {targetSeq}: {existingPotion ? 'Preparada en Mochila' : 'Sin Preparar'}</span>
              </div>
            </div>
          </div>

          {/* Botón de Ingesta y Apoteosis */}
          <div>
            {!isDigested && (
              <div style={{ fontSize: '0.75rem', color: '#f87171', fontStyle: 'italic', marginBottom: '8px', textAlign: 'center' }}>
                Advertencia de Colapso: Ingerir una poción sin digerir la previa acarrea riesgo mortal de mutación.
              </div>
            )}

            <button
              onClick={onAdvanceSequence}
              className="crimson-btn"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: (!isDigested || !existingPotion) ? 0.7 : 1
              }}
            >
              <Flame size={18} />
              <span>Consumir Brebaje & Desafiar Ascensión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanonicalGrimoire;
