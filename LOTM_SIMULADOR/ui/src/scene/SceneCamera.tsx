/**
 * CÁMARA ESPACIAL 2.5D — PATH TO GODHOOD (BRIEF-10.VISUAL-R2)
 * Aplica transformaciones tipadas de encuadre y zoom según el preset activo.
 */

import React from 'react';
import type { CameraPreset } from './types';

interface SceneCameraProps {
  preset: CameraPreset;
  children: React.ReactNode;
}

export const SceneCamera: React.FC<SceneCameraProps> = ({
  preset,
  children
}) => {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        transform: `translate3d(${preset.x}px, ${preset.y}px, 0px) scale(${preset.zoom})`,
        transformOrigin: '50% 50%',
        transition: 'transform var(--motion-camera, 300ms cubic-bezier(0.16, 1, 0.3, 1))',
        willChange: 'transform',
        pointerEvents: 'none'
      }}
    >
      {children}
    </div>
  );
};
