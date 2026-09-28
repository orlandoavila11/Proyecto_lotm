/**
 * COMPONENT & STATE GALLERY — HERRAMIENTA DE DESARROLLO P04
 * Galería aislada de componentes y estados diegéticos:
 * - Botones en matriz de 8 estados (idle, hover, focus, pressed, selected, disabled-reason, pending, error)
 * - Paneles de inspección, diálogo, confirmación, tooltips y bitácora.
 * - Emulador de resoluciones canónicas (1920x1080, 1366x768, 1280x720, 2560x1440, 1024x768)
 * - Conmutador de ampliación de texto al 200% (WCAG 2.1).
 */

import { useState } from 'react';
import { ActionButton } from '../presentation/ActionButton';
import { InspectionPanel } from '../presentation/InspectionPanel';
import { DialoguePanel } from '../presentation/DialoguePanel';
import { ConfirmationDialog } from '../presentation/ConfirmationDialog';
import { Tooltip } from '../presentation/Tooltip';
import { useToast, ToastProvider } from '../presentation/ToastHistory';
import { LoadingSurface, ErrorSurface } from '../presentation/LoadingErrorSurface';
import { 
  Maximize2, 
  Type, 
  BookOpen, 
  Compass, 
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

const RESOLUTION_PRESETS = [
  { label: '1920x1080 (Full HD)', width: 1920, height: 1080 },
  { label: '1366x768 (Laptop)', width: 1366, height: 768 },
  { label: '1280x720 (HD)', width: 1280, height: 720 },
  { label: '2560x1440 (2K)', width: 2560, height: 1440 },
  { label: '1024x768 (XGA)', width: 1024, height: 768 }
];

function GalleryContent() {
  const { showToast } = useToast();

  // Estados de control de modales
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [inspectionTheme, setInspectionTheme] = useState<'mahogany' | 'parchment'>('mahogany');
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Estados interactivos para botones de prueba
  const [selectedButton, setSelectedButton] = useState<string | null>('btn-1');
  const [pendingButton, setPendingButton] = useState(false);

  // Herramientas de visualización y accesibilidad
  const [textEnlarged, setTextEnlarged] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(RESOLUTION_PRESETS[0]);

  const togglePendingSimulation = () => {
    setPendingButton(true);
    setTimeout(() => setPendingButton(false), 2000);
  };

  return (
    <div 
      className={[
        'min-h-screen bg-[#090807] text-[#ede4d1] p-6 sm:p-10 font-serif select-none',
        textEnlarged ? 'text-[200%]' : 'text-base'
      ].join(' ')}
      style={{
        maxWidth: `${selectedResolution.width}px`,
        margin: '0 auto',
        boxShadow: '0 0 40px rgba(0,0,0,0.95)'
      }}
    >
      {/* Barra Superior de Herramientas de Desarrollo */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b-2 border-[#8c733e]/50">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#2b1f16] border border-[#8c733e] text-[#d4af37] text-xs font-bold rounded">
              DEV TOOL
            </span>
            <h1 className="text-2xl font-bold font-serif cinzel text-[#d4af37]">
              Galería Canónica de Componentes y Estados (P04)
            </h1>
          </div>
          <p className="text-xs text-[#a89f91] mt-1">
            Validación de tokens, contrastes, estados interactivos y responsividad WCAG 2.1 AA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Conmutador de 200% Tamaño de Texto */}
          <button
            type="button"
            onClick={() => setTextEnlarged(!textEnlarged)}
            className={[
              'flex items-center gap-2 px-3 py-1.5 text-xs border rounded transition-colors lotm-focus-ring cursor-pointer',
              textEnlarged
                ? 'bg-[#d4af37] text-[#1a1612] border-[#d4af37] font-bold'
                : 'bg-[#1c140e] text-[#ede4d1] border-[#8c733e] hover:bg-[#2b1f16]'
            ].join(' ')}
          >
            <Type size={14} />
            {textEnlarged ? 'Texto Normal' : 'Texto al 200%'}
          </button>

          {/* Selector de Resolución Emulada */}
          <div className="flex items-center gap-1.5 text-xs bg-[#1c140e] border border-[#8c733e] px-2 py-1 rounded">
            <Maximize2 size={14} className="text-[#d4af37]" />
            <select
              value={selectedResolution.label}
              onChange={(e) => {
                const res = RESOLUTION_PRESETS.find((r) => r.label === e.target.value);
                if (res) setSelectedResolution(res);
              }}
              className="bg-transparent text-[#ede4d1] outline-none text-xs cursor-pointer font-serif"
            >
              {RESOLUTION_PRESETS.map((r) => (
                <option key={r.label} value={r.label} className="bg-[#1c140e]">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Retorno al Juego */}
          <button
            type="button"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('gallery');
              window.location.href = url.toString();
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#851c22] hover:bg-[#991b1b] border border-red-700 text-white rounded transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Regresar al Juego
          </button>
        </div>
      </header>

      {/* =====================================================================
          SECCIÓN 1: MATRIZ DE ESTADOS DE ACTIONBUTTON
          ===================================================================== */}
      <section className="space-y-6 mb-12">
        <div className="border-b border-[#8c733e]/30 pb-2">
          <h2 className="text-lg font-bold text-[#d4af37] cinzel">
            1. Matriz de Estados de ActionButton (8 Estados Canónicos)
          </h2>
          <p className="text-xs text-[#a89f91]">
            Idle, hover, focus, pressed, selected, disabled-with-reason, pending, error.
          </p>
        </div>

        {/* Fila: Variantes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brass (Primario) */}
          <div className="p-4 bg-[#140e0a] border border-[#8c733e]/40 rounded space-y-3">
            <span className="text-xs font-bold text-[#d4af37] block">Variante Brass (Primaria)</span>
            <div className="flex flex-col gap-2">
              <ActionButton variant="brass" size="sm">Idle (Pequeño)</ActionButton>
              <ActionButton variant="brass" size="md">Idle (Mediano)</ActionButton>
              <ActionButton 
                variant="brass" 
                size="md" 
                selected={selectedButton === 'btn-1'}
                onClick={() => setSelectedButton('btn-1')}
              >
                Selected
              </ActionButton>
              <ActionButton 
                variant="brass" 
                size="md" 
                pending={pendingButton}
                onClick={togglePendingSimulation}
              >
                {pendingButton ? 'Procesando...' : 'Clic para Pending (2s)'}
              </ActionButton>
              <ActionButton 
                variant="brass" 
                size="md" 
                disabledReason="Requiere 24 peniques de cobre"
              >
                Disabled con Razón
              </ActionButton>
              <ActionButton variant="brass" size="md" error>
                Estado de Error
              </ActionButton>
            </div>
          </div>

          {/* Parchment (Editorial) */}
          <div className="p-4 bg-[#140e0a] border border-[#8c733e]/40 rounded space-y-3">
            <span className="text-xs font-bold text-[#ede4d1] block">Variante Parchment (Editorial)</span>
            <div className="flex flex-col gap-2">
              <ActionButton variant="parchment" size="sm">Idle (Pequeño)</ActionButton>
              <ActionButton variant="parchment" size="md">Idle (Mediano)</ActionButton>
              <ActionButton 
                variant="parchment" 
                size="md" 
                selected={selectedButton === 'btn-2'}
                onClick={() => setSelectedButton('btn-2')}
              >
                Selected
              </ActionButton>
              <ActionButton 
                variant="parchment" 
                size="md" 
                disabledReason="Documento firmado por el notario"
              >
                Disabled con Razón
              </ActionButton>
            </div>
          </div>

          {/* Danger (Crítico / Destructivo) */}
          <div className="p-4 bg-[#140e0a] border border-[#8c733e]/40 rounded space-y-3">
            <span className="text-xs font-bold text-red-400 block">Variante Danger (Crítico)</span>
            <div className="flex flex-col gap-2">
              <ActionButton variant="danger" size="sm">Huir del Combate</ActionButton>
              <ActionButton variant="danger" size="md">Destruir Evidencia</ActionButton>
              <ActionButton 
                variant="danger" 
                size="md" 
                disabledReason="Vigilancia policial activa en el callejón"
              >
                Disabled con Razón
              </ActionButton>
            </div>
          </div>

          {/* Ghost (Discreto / Volver) */}
          <div className="p-4 bg-[#140e0a] border border-[#8c733e]/40 rounded space-y-3">
            <span className="text-xs font-bold text-[#a89f91] block">Variante Ghost (Sutil)</span>
            <div className="flex flex-col gap-2">
              <ActionButton variant="ghost" size="sm">Volver</ActionButton>
              <ActionButton variant="ghost" size="md">Cancelar Operación</ActionButton>
              <ActionButton 
                variant="ghost" 
                size="md" 
                disabledReason="La acción no admite cancelación"
              >
                Disabled con Razón
              </ActionButton>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 2: PANELES Y MODALES ACCESIBLES
          ===================================================================== */}
      <section className="space-y-6 mb-12">
        <div className="border-b border-[#8c733e]/30 pb-2">
          <h2 className="text-lg font-bold text-[#d4af37] cinzel">
            2. Paneles de Inspección, Diálogo y Confirmación
          </h2>
          <p className="text-xs text-[#a89f91]">
            Validación de telones de fondo, trampa de foco, Escape y bloqueo de clics traseros.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <ActionButton
            variant="brass"
            size="md"
            icon={<BookOpen size={16} />}
            onClick={() => {
              setInspectionTheme('mahogany');
              setIsInspectionOpen(true);
            }}
          >
            Abrir InspectionPanel (Caoba)
          </ActionButton>

          <ActionButton
            variant="parchment"
            size="md"
            icon={<BookOpen size={16} />}
            onClick={() => {
              setInspectionTheme('parchment');
              setIsInspectionOpen(true);
            }}
          >
            Abrir InspectionPanel (Pergamino)
          </ActionButton>

          <ActionButton
            variant="brass"
            size="md"
            icon={<Compass size={16} />}
            onClick={() => setIsDialogueOpen(true)}
          >
            Abrir DialoguePanel (NPC)
          </ActionButton>

          <ActionButton
            variant="danger"
            size="md"
            icon={<ShieldAlert size={16} />}
            onClick={() => setIsConfirmOpen(true)}
          >
            Abrir ConfirmationDialog
          </ActionButton>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 3: TOOLTIPS, TOASTS Y AVISOS DE BITÁCORA
          ===================================================================== */}
      <section className="space-y-6 mb-12">
        <div className="border-b border-[#8c733e]/30 pb-2">
          <h2 className="text-lg font-bold text-[#d4af37] cinzel">
            3. Tooltips y Notificaciones Diegéticas (WCAG 2.1)
          </h2>
          <p className="text-xs text-[#a89f91]">
            Pistas no basadas únicamente en color y anuncios accesibles por aria-live.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 items-center">
          <Tooltip content="Llama viva y clara sobre peltre (≤ 7 palabras)" badge="Sanidad">
            <button
              type="button"
              className="px-3 py-1.5 bg-[#1a140f] border border-[#8c733e] rounded text-xs text-[#ede4d1] lotm-focus-ring cursor-pointer"
            >
              Hover / Focus para Tooltip
            </button>
          </Tooltip>

          <div className="flex gap-2">
            <ActionButton
              variant="brass"
              size="sm"
              onClick={() => showToast('Telegrama Recibido', 'El notario solicita tu presencia en Cherwood.', 'info')}
            >
              Toast Info
            </ActionButton>
            <ActionButton
              variant="brass"
              size="sm"
              onClick={() => showToast('Sombras Inquisitorias', 'Clérigos examinan tu vecindario.', 'warning')}
            >
              Toast Alerta
            </ActionButton>
            <ActionButton
              variant="danger"
              size="sm"
              onClick={() => showToast('Rechazo Místico', 'La poción rechaza la impureza del crisol.', 'error')}
            >
              Toast Error
            </ActionButton>
            <ActionButton
              variant="parchment"
              size="sm"
              onClick={() => showToast('Transmutación Completa', 'La Secuencia ha sido fijada con éxito.', 'success')}
            >
              Toast Éxito
            </ActionButton>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 4: SUPERFICIES DE CARGA Y RECUPERACIÓN DE ERROR
          ===================================================================== */}
      <section className="space-y-6 mb-12">
        <div className="border-b border-[#8c733e]/30 pb-2">
          <h2 className="text-lg font-bold text-[#d4af37] cinzel">
            4. Superficies de Carga y Error Recuperable
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#140e0a] border border-[#8c733e]/40 rounded flex items-center justify-center">
            <LoadingSurface 
              label="Sintonizando el Azogue..." 
              sublabel="Cargando proyecciones canónicas de Backlund."
            />
          </div>

          <div className="p-6 bg-[#140e0a] border border-[#8c733e]/40 rounded flex items-center justify-center">
            <ErrorSurface
              title="Dispersión Espiritual"
              message="No fue posible sincronizar el recibo transaccional con el santuario."
              onRetry={() => showToast('Reintento Enviado', 'Consultando el registro del servidor.', 'info')}
              onBack={() => showToast('Retorno', 'Volviendo al escritorio.', 'info')}
            />
          </div>
        </div>
      </section>

      {/* =====================================================================
          MODALES ACTIVOS CONTROLADOS POR ESTADO
          ===================================================================== */}

      {/* Panel de Inspección de Prueba */}
      <InspectionPanel
        isOpen={isInspectionOpen}
        theme={inspectionTheme}
        title="Almanaque Victoriano de Faltriquera"
        subtitle="Objeto interactivo físico del escritorio civil"
        proseMoment="El tic-tac del escape de cilindro recuerda el paso implacable del tiempo civil y oculto en Backlund."
        onClose={() => setIsInspectionOpen(false)}
        actions={
          <>
            <ActionButton
              variant="ghost"
              size="sm"
              onClick={() => setIsInspectionOpen(false)}
            >
              Cerrar
            </ActionButton>
            <ActionButton
              variant="brass"
              size="sm"
              onClick={() => {
                showToast('Almanaque Consultado', 'Franja de la Tarde, Día 4.', 'info');
                setIsInspectionOpen(false);
              }}
            >
              Examinar Cuadrante
            </ActionButton>
          </>
        }
      >
        <p className="text-xs text-inherit">
          Las páginas amarillentas registran fechas notariales, pagos de alquiler y notas apresuradas en tinta ferrogálica.
        </p>
      </InspectionPanel>

      {/* Diálogo Narrativo de Prueba */}
      <DialoguePanel
        isOpen={isDialogueOpen}
        speakerName="Sharron"
        speakerTitle="Secuencia 5 — Titiritero / Facciones Ocultas"
        proseText="El olor a cera quemada en tu desván no disimula la fragancia de la transmutación. Klein me habló de tu llegada a Cherwood."
        choices={[
          { id: 'c1', text: 'Compartir la pista de los juguetes calcinados.' },
          { id: 'c2', text: 'Preguntar por el movimiento del Club del Tarot.' },
          { id: 'c3', text: 'Desenvainar el revólver ante su presencia espectral.', isDanger: true }
        ]}
        onSelectChoice={(choiceId) => {
          showToast('Elección Tomada', `Opción ${choiceId} seleccionada.`, 'info');
          setIsDialogueOpen(false);
        }}
        onClose={() => setIsDialogueOpen(false)}
      />

      {/* Confirmación Crítica de Prueba */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        title="¿Consumir Poción de Secuencia 8?"
        message="La ingestión de la fórmula 'Payaso' iniciará la transmutación somática. Si tu digestión de 'Vidente' no es plena, el riesgo de pérdida de control será severo."
        consequencesPreview={[
          'Incremento de Sanidad y Ruina según coherencia de actuación.',
          'Consumo irreversible de ingredientes del inventario.',
          'Mutación permanente de habilidades tácticas y espirituales.'
        ]}
        isDestructive={true}
        confirmLabel="Beber la Poción"
        cancelLabel="Conservar el Frasco"
        onConfirm={() => {
          showToast('Poción Consumida', 'La digestión ha comenzado.', 'warning');
          setIsConfirmOpen(false);
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}

export function ComponentGallery() {
  return (
    <ToastProvider>
      <GalleryContent />
    </ToastProvider>
  );
}

export default ComponentGallery;
