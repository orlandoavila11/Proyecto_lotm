import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { loadAssetManifest } from './assets';
import { installScrollEdges } from './hud/scrollEdges';
import './styles/hud.css';

loadAssetManifest()
  .catch((err) => console.error(err))
  .finally(() => {
    installScrollEdges();
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
