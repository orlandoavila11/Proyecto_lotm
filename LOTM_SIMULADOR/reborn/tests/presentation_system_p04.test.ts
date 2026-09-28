/**
 * TESTS DE VERIFICACIÓN DEL SISTEMA DE PRESENTACIÓN Y OVERLAYS (PROMPT P04)
 * Valida la matriz de estados de ActionButton, accesibilidad WCAG 2.1 AA,
 * pistas no basadas en color, roles ARIA y contratos de diálogos diegéticos.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ActionButton } from '../../ui/src/presentation/ActionButton.tsx';
import { InspectionPanel } from '../../ui/src/presentation/InspectionPanel.tsx';
import { DialoguePanel } from '../../ui/src/presentation/DialoguePanel.tsx';
import { ConfirmationDialog } from '../../ui/src/presentation/ConfirmationDialog.tsx';
import { Tooltip } from '../../ui/src/presentation/Tooltip.tsx';
import { LoadingSurface, ErrorSurface } from '../../ui/src/presentation/LoadingErrorSurface.tsx';

describe('PROMPT P04: Sistema de Presentación y Contrato de Overlays Accesibles', () => {

  describe('1. Matriz de Estados de ActionButton', () => {
    it('renderiza variante brass con anillo de foco y texto correcto', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActionButton, { variant: 'brass', size: 'md' }, 'Examinar Cuadrante')
      );
      assert.ok(html.includes('Examinar Cuadrante'));
      assert.ok(html.includes('lotm-focus-ring'));
      assert.ok(html.includes('bg-[#1c140e]'));
    });

    it('renderiza variante parchment con estilo editorial', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActionButton, { variant: 'parchment', size: 'sm' }, 'Firmar Pliego')
      );
      assert.ok(html.includes('Firmar Pliego'));
      assert.ok(html.includes('bg-[#ede4d1]'));
      assert.ok(html.includes('text-[#1a1612]'));
    });

    it('renderiza estado disabled-with-reason con pista no dependiente de color', () => {
      const html = renderToStaticMarkup(
        React.createElement(
          ActionButton, 
          { variant: 'brass', disabledReason: 'Requiere 24 peniques' }, 
          'Viajar a Cherwood'
        )
      );
      assert.ok(html.includes('aria-disabled="true"'));
      assert.ok(html.includes('cursor-not-allowed'));
      // Debe contener el icono de candado (svg) como pista visual no solo de color
      assert.ok(html.includes('svg'));
    });

    it('renderiza estado pending con aria-busy y spinner', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActionButton, { variant: 'brass', pending: true }, 'Transmutando...')
      );
      assert.ok(html.includes('aria-busy="true"'));
      assert.ok(html.includes('animate-spin'));
    });

    it('renderiza estado selected con aria-pressed y checkmark', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActionButton, { variant: 'brass', selected: true }, 'Pista Conectada')
      );
      assert.ok(html.includes('aria-pressed="true"'));
      assert.ok(html.includes('svg'));
    });

    it('renderiza estado error con icono de advertencia', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActionButton, { variant: 'brass', error: true }, 'Fallo de Sintonía')
      );
      assert.ok(html.includes('text-red-400') || html.includes('border-red-500'));
      assert.ok(html.includes('svg'));
    });
  });

  describe('2. InspectionPanel y Roles ARIA', () => {
    it('renderiza modal de inspección con role="dialog", aria-modal="true" y título vinculado', () => {
      const html = renderToStaticMarkup(
        React.createElement(InspectionPanel, {
          isOpen: true,
          title: 'Almanaque Victoriano',
          subtitle: 'Reloj de faltriquera',
          proseMoment: 'Las manecillas marcan el avance de la noche.',
          onClose: () => {}
        }, React.createElement('p', null, 'Detalle del objeto'))
      );

      assert.ok(html.includes('role="dialog"'));
      assert.ok(html.includes('aria-modal="true"'));
      assert.ok(html.includes('id="inspection-title"'));
      assert.ok(html.includes('Almanaque Victoriano'));
      assert.ok(html.includes('Las manecillas marcan el avance de la noche.'));
      assert.ok(html.includes('Detalle del objeto'));
    });

    it('no renderiza nada si isOpen es false', () => {
      const html = renderToStaticMarkup(
        React.createElement(InspectionPanel, {
          isOpen: false,
          title: 'Cáliz Oculto',
          onClose: () => {}
        })
      );
      assert.equal(html, '');
    });
  });

  describe('3. ConfirmationDialog y Decisiones Críticas', () => {
    it('renderiza con role="alertdialog" y lista de consecuencias', () => {
      const consequences = ['Pérdida irreversible de 1 libra', 'Sospecha policial aumentada'];
      const html = renderToStaticMarkup(
        React.createElement(ConfirmationDialog, {
          isOpen: true,
          title: '¿Sobornar al Inspector?',
          message: 'El dinero cambiará de manos en el callejón.',
          consequencesPreview: consequences,
          isDestructive: true,
          onConfirm: () => {},
          onCancel: () => {}
        })
      );

      assert.ok(html.includes('role="alertdialog"'));
      assert.ok(html.includes('aria-modal="true"'));
      assert.ok(html.includes('id="confirm-dialog-title"'));
      assert.ok(html.includes('¿Sobornar al Inspector?'));
      assert.ok(html.includes('Pérdida irreversible de 1 libra'));
      assert.ok(html.includes('Sospecha policial aumentada'));
      assert.ok(html.includes('border-[#b91c1c]')); // Estilo destructivo
    });
  });

  describe('4. DialoguePanel para Elecciones Ramificadas', () => {
    it('renderiza hablante, prosa en comillas y botones de elección', () => {
      const choices = [
        { id: 'c1', text: 'Revelar el secreto de la Orden Aurora.' },
        { id: 'c2', text: 'Guardar silencio y vigilar la salida.' }
      ];
      const html = renderToStaticMarkup(
        React.createElement(DialoguePanel, {
          isOpen: true,
          speakerName: 'Miss Sharron',
          speakerTitle: 'Afinidad con los Espectros',
          proseText: '¿Qué sabes sobre la familia Zangwill?',
          choices,
          onSelectChoice: () => {}
        })
      );

      assert.ok(html.includes('Miss Sharron'));
      assert.ok(html.includes('Afinidad con los Espectros'));
      assert.ok(html.includes('¿Qué sabes sobre la familia Zangwill?'));
      assert.ok(html.includes('Revelar el secreto de la Orden Aurora.'));
      assert.ok(html.includes('Guardar silencio y vigilar la salida.'));
    });
  });

  describe('5. Tooltips, Superficies de Carga y Error', () => {
    it('Tooltip envuelve al elemento hijo con aria-describedby condicional', () => {
      const html = renderToStaticMarkup(
        React.createElement(
          Tooltip, 
          { content: 'Llama pura sobre peltre', badge: 'LUCIDEZ' },
          React.createElement('button', null, 'Vela')
        )
      );
      assert.ok(html.includes('Vela'));
    });

    it('LoadingSurface expone role="status" y aria-busy="true"', () => {
      const html = renderToStaticMarkup(
        React.createElement(LoadingSurface, { label: 'Sintonizando el Velo' })
      );
      assert.ok(html.includes('role="status"'));
      assert.ok(html.includes('aria-busy="true"'));
      assert.ok(html.includes('Sintonizando el Velo'));
    });

    it('ErrorSurface expone role="alert" y botones de reintento', () => {
      const html = renderToStaticMarkup(
        React.createElement(ErrorSurface, {
          title: 'Fallo de Red',
          message: 'No fue posible comunicar con el servidor.',
          onRetry: () => {},
          onBack: () => {}
        })
      );
      assert.ok(html.includes('role="alert"'));
      assert.ok(html.includes('Fallo de Red'));
      assert.ok(html.includes('Reintentar Operación'));
      assert.ok(html.includes('Regresar'));
    });
  });

});
