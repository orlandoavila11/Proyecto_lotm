/**
 * ESCENA ILUSTRADA DE VIAJE POR BACKLUND (V02) — PATH TO GODHOOD (PROMPT P08)
 * Permite abandonar el refugio, contratar carruajes con tarifa autoritativa (2s / 24d),
 * observar el estado de la niebla/tensión y acceder a la escena de investigación de Cherwood.
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Compass, CloudFog, Landmark, Coins, Check, AlertCircle, Eye } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface DistrictInfo {
  id: string;
  name: string;
  district_name: string;
  tension_level: number;
  danger_rank: string;
  smog_level: string;
  landmark: string;
  description: string;
}

interface TravelViewProps {
  onBackToDesk: () => void;
  onOpenInvestigationLocation: () => void;
  characterId: string;
  currentLocationId?: string;
  walletText?: string;
  rawPence?: number;
  onLocationChanged?: (newLocation: string, remainingPence: number) => void;
}

function normalizeDistrictId(rawId?: string): string {
  if (!rawId) return 'DIST_CHERWOOD';
  if (rawId.includes('CHERWOOD') || rawId.toLowerCase().includes('cherwood')) return 'DIST_CHERWOOD';
  if (rawId.includes('EAST') || rawId.toLowerCase().includes('este')) return 'DIST_EAST_BOROUGH';
  if (rawId.includes('QUEEN') || rawId.toLowerCase().includes('reina')) return 'DIST_QUEEN';
  if (rawId.includes('BRIDGE') || rawId.toLowerCase().includes('puente')) return 'DIST_BRIDGE';
  if (rawId.includes('BAYAM') || rawId.toLowerCase().includes('bayam')) return 'DIST_BAYAM';
  return rawId;
}

export const TravelView: React.FC<TravelViewProps> = ({
  onBackToDesk,
  onOpenInvestigationLocation,
  characterId,
  currentLocationId = 'DIST_CHERWOOD',
  walletText = '2 soberanos de oro, 8 chelines de plata y 4 peniques de cobre',
  rawPence = 240,
  onLocationChanged
}) => {
  const [districts, setDistricts] = useState<DistrictInfo[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>(normalizeDistrictId(currentLocationId));
  const [currentPence, setCurrentPence] = useState<number>(rawPence);
  const [selectedDestination, setSelectedDestination] = useState<DistrictInfo | null>(null);
  const [isTravelling, setIsTravelling] = useState<boolean>(false);
  const [travelMessage, setTravelMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Escuchar tecla Escape para regresar al refugio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBackToDesk();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToDesk]);

  // Cargar distritos autoritativos
  useEffect(() => {
    apiClient.getCityDistricts()
      .then(res => {
        if (res?.districts) {
          setDistricts(res.districts);
        }
      })
      .catch(err => {
        console.warn('Error al cargar distritos:', err);
      });
  }, []);

  const handleSelectDistrict = (district: DistrictInfo) => {
    setErrorMessage(null);
    setTravelMessage(null);
    if (district.id === currentLocation) {
      return;
    }
    setSelectedDestination(district);
  };

  const handleConfirmTravel = async () => {
    if (!selectedDestination || isTravelling) return;

    if (currentPence < 24) {
      setErrorMessage('Tus bolsillos no alcanzan la tarifa reglamentaria del Gremio de Cocheros (2s requeridos).');
      return;
    }

    setIsTravelling(true);
    setErrorMessage(null);
    setTravelMessage(null);

    try {
      const commandId = `cmd_travel_${Date.now()}_${selectedDestination.id}`;
      const res = await apiClient.travelToDistrict({
        characterId,
        destinationDistrict: selectedDestination.id,
        commandId
      });

      if (res?.success) {
        setCurrentLocation(res.newLocation);
        const updatedPence = res.remainingPence !== undefined ? res.remainingPence : currentPence - 24;
        setCurrentPence(updatedPence);
        setTravelMessage(res.message || `Has llegado a [${selectedDestination.name}]. ${res.encounter || ''}`);
        setSelectedDestination(null);

        if (onLocationChanged) {
          onLocationChanged(res.newLocation, updatedPence);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'El cochero detuvo la marcha repentinamente. No se consumió moneda.');
    } finally {
      setIsTravelling(false);
    }
  };

  const currentDistrictObj = districts.find(d => d.id === currentLocation) || {
    id: currentLocation,
    name: 'Distrito de Cherwood',
    district_name: 'Distrito de Cherwood',
    landmark: 'Mansión Sterling & Club de Adivinación',
    smog_level: 'Smog Amarillo de Carbón',
    danger_rank: 'MEDIO',
    description: 'Calles adoquinadas residenciales, despachos de procuradores y pensiones modestas.'
  };

  return (
    <div 
      className="p-8 flex flex-col justify-between select-none relative overflow-hidden text-[#e5ded2]"
      style={{
        width: '1920px',
        height: '1080px',
        backgroundColor: '#0a0807',
        backgroundImage: 'linear-gradient(180deg, rgba(10, 8, 7, 0.82) 0%, rgba(10, 8, 7, 0.94) 100%), url(/art/GFX61_vignette_backlund_streets.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Cabecera Superior */}
      <header className="flex justify-between items-center border-b-2 border-[#3d2f21] pb-4 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
            type="button"
            className="px-4 py-2 bg-[#171410] border border-[#383024] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            Regresar al Refugio (Esc)
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-[#d4af37]" style={{ fontFamily: 'Cinzel' }}>
              DESPLAZAMIENTO POR BACKLUND (V02)
            </h1>
            <p className="text-xs text-[#968c7e] italic">
              Líneas de coches de punto y carruajes de alquiler bajo la niebla perpetua de Loen
            </p>
          </div>
        </div>

        {/* Monedero y Ubicación Actual */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#191714] px-4 py-2 rounded border border-[#383024] text-xs font-serif">
            <Coins size={15} className="text-[#d4af37]" />
            <span>Monedero: <strong className="text-[#d4af37]">{walletText}</strong></span>
          </div>

          <div className="flex items-center gap-2 bg-[#191714] px-4 py-2 rounded border border-[#8c733e] text-xs font-serif">
            <MapPin size={15} className="text-[#d4af37]" />
            <span>Ubicación: <strong className="text-[#d4af37]">{currentDistrictObj.name}</strong></span>
          </div>
        </div>
      </header>

      {/* Contenido Central: Cuadrícula de Destinos y Panel de Viaje */}
      <div className="grid grid-cols-12 gap-8 my-auto z-10">
        
        {/* Lista de Distritos Autorizados (7 de 12) */}
        <div className="col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#3d2f21] pb-2">
            <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider font-serif flex items-center gap-2">
              <Compass size={16} />
              Paradas de Carruaje Disponibles
            </h2>
            <span className="text-[11px] text-[#968c7e] italic font-serif">
              Tarifa fijada por ordenanza: 2 chelines (24 peniques)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {districts.map((district) => {
              const isCurrent = district.id === currentLocation;
              const isSelected = selectedDestination?.id === district.id;

              return (
                <div
                  key={district.id}
                  onClick={() => handleSelectDistrict(district)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#1e1913]/90 border-[#5e4326] opacity-90'
                      : isSelected
                      ? 'bg-[#291e13] border-[#d4af37] shadow-xl'
                      : 'bg-[#15120e]/90 border-[#382b1d] hover:border-[#8c733e]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif font-bold text-sm text-[#f5ebd9]" style={{ fontFamily: 'Cinzel' }}>
                        {district.name}
                      </h3>
                      {isCurrent ? (
                        <span className="text-[10px] bg-[#3d2f21] text-[#d4af37] px-2 py-0.5 rounded font-serif">
                          AQUÍ
                        </span>
                      ) : (
                        <span className="text-[10px] bg-[#1a1510] text-[#968c7e] border border-[#3d2f21] px-2 py-0.5 rounded font-serif">
                          2s
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#b8a68d] leading-relaxed mb-3 font-serif">
                      {district.description}
                    </p>
                  </div>

                  <div className="border-t border-[#2e2317] pt-2 text-[11px] text-[#8c7a65] flex justify-between items-center font-serif">
                    <span className="flex items-center gap-1">
                      <Landmark size={12} className="text-[#8c733e]" />
                      {district.landmark}
                    </span>
                    <span className="flex items-center gap-1">
                      <CloudFog size={12} className="text-[#786a58]" />
                      {district.smog_level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Lateral: Confirmación de Viaje / Escena de Caso (5 de 12) */}
        <div className="col-span-5 flex flex-col gap-4">
          
          {/* Tarjeta de Acción Inmediata: Explorar Escena del Caso si estamos en Cherwood */}
          {currentLocation === 'DIST_CHERWOOD' && (
            <div 
              className="p-6 rounded-xl border-2 border-[#8c733e] shadow-2xl relative overflow-hidden"
              style={{
                backgroundColor: '#1b140e',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 0 30px rgba(140, 115, 62, 0.15)'
              }}
            >
              <div className="flex items-center gap-2 mb-2 text-[#d4af37]">
                <Eye size={18} />
                <span className="font-serif font-bold text-xs uppercase tracking-widest">
                  Investigación Activa en este Distrito
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#f5ebd9] mb-2 font-serif" style={{ fontFamily: 'Cinzel' }}>
                Mansión Sterling & Orfanato San Dionisio
              </h3>
              <p className="text-xs text-[#ded5c5] italic leading-relaxed mb-5 font-serif">
                Has descendido en las inmediaciones del hogar del Dr. Avery Sterling. La chimenea exterior aún humea tenuemente y las ventanas del desván del orfanato asoman tras los teñidos callejones de Cherwood.
              </p>

              <button
                type="button"
                onClick={onOpenInvestigationLocation}
                className="w-full crimson-btn py-3 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Eye size={15} />
                Inspeccionar Escena del Caso (V03)
              </button>
            </div>
          )}

          {/* Tarjeta de Previsualización y Confirmación de Carruaje */}
          {selectedDestination ? (
            <div 
              className="p-6 rounded-xl border-2 border-[#d4af37] shadow-2xl flex flex-col justify-between"
              style={{
                backgroundColor: '#18130e',
                boxShadow: '0 10px 30px rgba(0,0,0,0.85)'
              }}
            >
              <div>
                <span className="font-serif font-bold text-xs text-[#d4af37] uppercase tracking-wider block mb-2">
                  Previsualización de Traslado en Carruaje
                </span>
                <h3 className="text-base font-bold text-[#f5ebd9] mb-3 font-serif" style={{ fontFamily: 'Cinzel' }}>
                  Hacia: {selectedDestination.name}
                </h3>
                <p className="text-xs text-[#ded5c5] leading-relaxed mb-4 font-serif">
                  El cochero conducirá a través del tráfico de vapor y el fango de Backlund hacia <strong>{selectedDestination.landmark}</strong>. La bruma exterior es de tipo <em>{selectedDestination.smog_level}</em>.
                </p>

                <div className="bg-[#100d0a] p-3 rounded border border-[#3d2e1d] text-xs font-serif mb-4 flex justify-between items-center">
                  <span className="text-[#a89885]">Coste de alquiler:</span>
                  <span className="font-bold text-[#d4af37]">2 chelines (24 d)</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isTravelling}
                  onClick={() => setSelectedDestination(null)}
                  className="w-1/3 py-2.5 rounded border border-[#4a3b29] text-[#9c8e7b] hover:text-[#e5ded2] text-xs font-serif transition-colors cursor-pointer"
                >
                  Desistir
                </button>
                <button
                  type="button"
                  disabled={isTravelling || currentPence < 24}
                  onClick={handleConfirmTravel}
                  className="w-2/3 crimson-btn py-2.5 text-xs uppercase tracking-wider font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isTravelling ? 'Avanzando en la niebla...' : 'Contratar Carruaje (2s)'}
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="p-6 rounded-xl border border-[#332617] text-center flex flex-col items-center justify-center h-48"
              style={{ backgroundColor: '#120e0a' }}
            >
              <Compass size={28} className="text-[#5e4326] mb-2" />
              <p className="text-xs text-[#786a58] italic font-serif">
                Selecciona una parada en el mapa para consultar la tarifa y los puntos de interés.
              </p>
            </div>
          )}

          {/* Mensajes de Resultado o Error */}
          {travelMessage && (
            <div className="p-4 rounded-xl border border-[#4a7238] bg-[#162112] text-xs text-[#d4ebd0] font-serif leading-relaxed flex items-start gap-2 shadow-lg">
              <Check size={16} className="text-[#8bc34a] shrink-0 mt-0.5" />
              <span>{travelMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl border border-[#782823] bg-[#241210] text-xs text-[#fca5a5] font-serif leading-relaxed flex items-start gap-2 shadow-lg">
              <AlertCircle size={16} className="text-[#f87171] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>
      </div>

      {/* Pie de Página Atmosférico */}
      <footer className="text-center text-[11px] text-[#6b583f] italic font-serif z-10 border-t border-[#261d14] pt-3">
        "Las ruedas de radios de hierro crujen sobre el lodo. En Backlund, ningún destino está demasiado lejos de una sombra."
      </footer>
    </div>
  );
};
