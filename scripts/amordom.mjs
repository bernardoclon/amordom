import ActorPersonajeData from './data-models/actor-personaje.mjs';
import { bindArcanaRolls, bindAttributeRolls } from './dices.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

function calculateDerivedHealth(attributes = {}) {
  const strength = Number(attributes.fuerza) || 0;
  const willpower = Number(attributes.voluntad) || 0;
  const threshold = strength + Math.floor(willpower / 2);
  return { umbral: threshold, total: threshold * 3 };
}

function calculateInitiative(attributes = {}) {
  const reflexes = Number(attributes.destreza) || 0;
  const intelligence = Number(attributes.percepcion) || 0;
  return reflexes + Math.floor(intelligence / 2);
}

export default class AmorDomCharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  
  static DEFAULT_OPTIONS = {
    // CRÍTICO: {id} es obligatorio para el correcto funcionamiento de ventanas en V12+
    id: 'amordom-character-sheet-{id}',
    classes: ['amordom', 'sheet', 'actor'],
    position: {
      width: 850,
      height: 780
    },
    window: {
      title: 'Amor de Otro Mundo',
      icon: 'fa-solid fa-heart',
      resizable: true
    },
    form: {
      submitOnChange: false,
      closeOnSubmit: false
    }
  };

  static PARTS = {
    main: {
      template: 'systems/amordom/templates/actor/character-sheet.hbs'
    }
  };

  _syncTemplateForMode() {
    const template = this._isBurnedMode
      ? 'systems/amordom/templates/actor/character-sheet-burned.hbs'
      : 'systems/amordom/templates/actor/character-sheet.hbs';
    this.constructor.PARTS.main.template = template;
  }

  /**
   * BLINDAJE EXTREMO DE ANIMACIÓN DE CIERRE:
   * Foundry V12 intenta re-dibujar la hoja si se auto-guarda al perder el foco (click en cerrar),
   * lo que vacía el HTML antes de que termine la animación.
   * Con esta triple comprobación evitamos el pantallazo blanco.
   */
  render(force=false, options={}) {
    if (this.state >= 3) return this; // 3 = CLOSING, 4 = CLOSED
    return super.render(force, options);
  }

  _canRender(options) {
    if (this.state >= 3) return false;
    return super._canRender(options);
  }

  _replaceHTML(result, content, options) {
    if (this.state >= 3) return;
    super._replaceHTML(result, content, options);
  }

  async _prepareContext(options) {
    this._isBurnedMode ??= false;
    this._syncTemplateForMode();
    const context = await super._prepareContext(options);

    const currentSystem = this.document.system;
    const baseSystem = currentSystem.toObject ? currentSystem.toObject() : foundry.utils.deepClone(currentSystem);
    const copyState = currentSystem.copia
      ? foundry.utils.deepClone(currentSystem.copia)
      : foundry.utils.deepClone(baseSystem);
    if (!currentSystem.copia) {
      await this.document.update({ ['system.copia']: copyState }, { diff: false });
    }

    const baseDerivedHealth = calculateDerivedHealth(baseSystem.atributos);
    const copyDerivedHealth = calculateDerivedHealth(copyState.atributos);
    const baseInitiative = calculateInitiative(baseSystem.atributos);
    const copyInitiative = calculateInitiative(copyState.atributos);
    baseSystem.salud = { ...baseSystem.salud, ...baseDerivedHealth };
    copyState.salud = { ...copyState.salud, ...copyDerivedHealth };
    baseSystem.combate = { ...baseSystem.combate, iniciativa: baseInitiative };
    copyState.combate = { ...copyState.combate, iniciativa: copyInitiative };

    const healthUpdates = {};
    if (currentSystem.salud?.umbral !== baseDerivedHealth.umbral || currentSystem.salud?.total !== baseDerivedHealth.total) {
      healthUpdates['system.salud.umbral'] = baseDerivedHealth.umbral;
      healthUpdates['system.salud.total'] = baseDerivedHealth.total;
    }
    const storedCopyHealth = currentSystem.copia?.salud;
    if (storedCopyHealth?.umbral !== copyDerivedHealth.umbral || storedCopyHealth?.total !== copyDerivedHealth.total) {
      healthUpdates['system.copia.salud.umbral'] = copyDerivedHealth.umbral;
      healthUpdates['system.copia.salud.total'] = copyDerivedHealth.total;
    }
    if (currentSystem.combate?.iniciativa !== baseInitiative) {
      healthUpdates['system.combate.iniciativa'] = baseInitiative;
    }
    if (currentSystem.copia?.combate?.iniciativa !== copyInitiative) {
      healthUpdates['system.copia.combate.iniciativa'] = copyInitiative;
    }
    if (Object.keys(healthUpdates).length) {
      await this.document.update(healthUpdates, { diff: false });
    }

    const displaySystem = this._isBurnedMode ? foundry.utils.deepClone(baseSystem) : baseSystem;
    if (this._isBurnedMode) {
      const copySource = copyState;
      displaySystem.salud = { ...displaySystem.salud, ...copySource.salud };
      displaySystem.heridas = { ...displaySystem.heridas, ...copySource.heridas };
      displaySystem.distorcion = { ...displaySystem.distorcion, ...copySource.distorcion };
      displaySystem.drama = { ...displaySystem.drama, ...copySource.drama };
      displaySystem.extasis = { ...displaySystem.extasis, ...copySource.extasis };
      displaySystem.atributos = { ...displaySystem.atributos, ...copySource.atributos };
      displaySystem.habilidades = { ...displaySystem.habilidades, ...copySource.habilidades };
      displaySystem.habilidadesArcanas = foundry.utils.deepClone(
        copySource.habilidadesArcanas ?? displaySystem.habilidadesArcanas ?? []
      );
      displaySystem.combate = { ...displaySystem.combate, ...copySource.combate };
      displaySystem.hitos = currentSystem.hitos;
      displaySystem.complicaciones = currentSystem.complicaciones;
      displaySystem.logros = currentSystem.logros;
      displaySystem.recursos = currentSystem.recursos;
      displaySystem.inventario = currentSystem.inventario;
      displaySystem.armas = currentSystem.combate?.armas;
    }

    const baseActor = this.document.toObject ? this.document.toObject() : this.document;
    context.actor = { ...baseActor, system: displaySystem };
    context.system = displaySystem;
    context.copy = copyState;
    context.isBurnedMode = this._isBurnedMode;
    return context;
  }

  _setTab(tabName) {
    const targetTab = tabName;
    this._activeTab = targetTab;
    const form = this.element;
    if (!form) return;

    form.querySelectorAll('[data-tab-panel]').forEach((panel) => {
      const active = panel.dataset.tabPanel === targetTab;
      panel.classList.toggle('is-active', active);
      if (active) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    form.querySelectorAll('[data-tab-button]').forEach((button) => {
      const active = button.dataset.tabButton === targetTab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  _setSheetMode(mode) {
    this._sheetMode = mode;
    const form = this.element;
    if (!form) return;

    form.querySelectorAll('[data-sheet-panel]').forEach((panel) => {
      const active = panel.dataset.sheetPanel === mode;
      panel.classList.toggle('is-active', active);
      if (active) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  _bindFormPersistence() {
    const root = this.element;
    if (!root || root.dataset.adomFormPersistence === 'bound') return;
    root.dataset.adomFormPersistence = 'bound';

    root.addEventListener('change', async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.name) return;
      if (
        target.name === 'system.salud.umbral' ||
        target.name === 'system.salud.total' ||
        target.name === 'system.copia.salud.umbral' ||
        target.name === 'system.copia.salud.total' ||
        target.name === 'system.combate.iniciativa' ||
        target.name === 'system.copia.combate.iniciativa'
      ) return;

      const listItemMatch = target.name.match(/^system\.(combate\.armas|habilidadesArcanas|hitos|complicaciones|logros|recursos|inventario)\.(\d+)\.([^.]+)$/);
      if (listItemMatch) {
        const [, listPath, itemIndex, property] = listItemMatch;
        const isBurnedCopyList = this._isBurnedMode && ['combate.armas', 'habilidadesArcanas'].includes(listPath);
        const dataPath = `${isBurnedCopyList ? 'copia.' : ''}${listPath}`;
        const currentItems = foundry.utils.getProperty(this.document.system, dataPath) ?? [];
        const updatedItems = foundry.utils.deepClone(currentItems);
        if (!updatedItems[itemIndex]) return;

        let itemValue = target.value;
        if (target.type === 'number') itemValue = target.value === '' ? 0 : Number(target.value);
        updatedItems[itemIndex][property] = itemValue;
        await this.document.update({ [`system.${dataPath}`]: updatedItems }, { diff: false });
        return;
      }

      if (target.matches(
        '.distorsion .amordom-check input[type="checkbox"], ' +
        '.drama-checkboxes .amordom-check input[type="checkbox"], ' +
        '.extasis-checkboxes .amordom-check input[type="checkbox"]'
      )) return;

      const isActorField = target.name === 'name' || target.name === 'system.concepto';
      const isBurnedCopyField = this._isBurnedMode && !isActorField && !target.name.startsWith('system.copia.');
      const persistencePath = isBurnedCopyField
        ? `system.copia${target.name.slice('system'.length)}`
        : target.name;

      let nextValue = target.value;
      if (target.type === 'checkbox') {
        nextValue = target.checked;
      } else if (target.type === 'number') {
        nextValue = target.value === '' ? 0 : Number(target.value);
      }

      const updateData = {};
      foundry.utils.setProperty(updateData, persistencePath, nextValue);

      const isMainAttribute = target.name === 'system.atributos.fuerza' || target.name === 'system.atributos.voluntad';
      const isCopyAttribute = target.name === 'system.copia.atributos.fuerza' || target.name === 'system.copia.atributos.voluntad';
      if (isMainAttribute || isCopyAttribute) {
        const isCopyHealth = isCopyAttribute || this._isBurnedMode;
        const attributesPath = isCopyHealth ? 'copia.atributos' : 'atributos';
        const currentAttributes = foundry.utils.getProperty(this.document.system, attributesPath) ?? {};
        const attributes = {
          ...currentAttributes,
          [target.name.endsWith('.fuerza') ? 'fuerza' : 'voluntad']: nextValue
        };
        const derivedHealth = calculateDerivedHealth(attributes);
        const healthPath = isCopyHealth ? 'system.copia.salud' : 'system.salud';
        foundry.utils.setProperty(updateData, `${healthPath}.umbral`, derivedHealth.umbral);
        foundry.utils.setProperty(updateData, `${healthPath}.total`, derivedHealth.total);
        const healthInputPrefix = this._isBurnedMode ? 'system.salud' : healthPath;
        const thresholdInput = root.querySelector(`[name="${healthInputPrefix}.umbral"]`);
        const totalInput = root.querySelector(`[name="${healthInputPrefix}.total"]`);
        if (thresholdInput) thresholdInput.value = derivedHealth.umbral;
        if (totalInput) totalInput.value = derivedHealth.total;
      }

      const isMainInitiativeAttribute = target.name === 'system.atributos.destreza' || target.name === 'system.atributos.percepcion';
      const isCopyInitiativeAttribute = target.name === 'system.copia.atributos.destreza' || target.name === 'system.copia.atributos.percepcion';
      if (isMainInitiativeAttribute || isCopyInitiativeAttribute) {
        const isCopyInitiative = isCopyInitiativeAttribute || this._isBurnedMode;
        const attributesPath = isCopyInitiative ? 'copia.atributos' : 'atributos';
        const currentAttributes = foundry.utils.getProperty(this.document.system, attributesPath) ?? {};
        const attributes = {
          ...currentAttributes,
          [target.name.endsWith('.destreza') ? 'destreza' : 'percepcion']: nextValue
        };
        const initiative = calculateInitiative(attributes);
        const initiativePath = isCopyInitiative ? 'system.copia.combate.iniciativa' : 'system.combate.iniciativa';
        foundry.utils.setProperty(updateData, initiativePath, initiative);
        const initiativeInputName = this._isBurnedMode ? 'system.combate.iniciativa' : initiativePath;
        const initiativeInput = root.querySelector(`[name="${initiativeInputName}"]`);
        if (initiativeInput) initiativeInput.value = initiative;
      }

      await this.document.update(updateData, { diff: false });
    });
  }

  _bindInteractionHandlers() {
    const root = this.element;
    if (!root) return;

    const actor = this.document;
    if (!actor) return;

    const fieldPathMap = {
      armas: 'combate.armas',
      habilidadesArcanas: 'habilidadesArcanas',
      hitos: 'hitos',
      complicaciones: 'complicaciones',
      logros: 'logros',
      recursos: 'recursos',
      inventario: 'inventario'
    };

    const getList = (fieldPath) => {
      const sourcePath = this._isBurnedMode && ['combate.armas', 'habilidadesArcanas'].includes(fieldPath)
        ? `copia.${fieldPath}`
        : fieldPath;
      const value = foundry.utils.getProperty(actor.system, sourcePath);
      return Array.isArray(value) ? value : [];
    };

    const persistList = async (fieldPath, nextItems) => {
      const targetPath = this._isBurnedMode && ['combate.armas', 'habilidadesArcanas'].includes(fieldPath)
        ? `system.copia.${fieldPath}`
        : `system.${fieldPath}`;
      await actor.update({ [targetPath]: nextItems });
    };

    const suggestedLabel = (baseLabel, index) => `${baseLabel} ${index + 1}`;
    const buildItem = (fieldPath, index) => {
      if (fieldPath === 'combate.armas') return { nombre: suggestedLabel('Arma', index), valor: 0 };
      if (fieldPath === 'habilidadesArcanas') return { nombre: suggestedLabel('Arcana', index), valor: 0 };
      if (fieldPath === 'recursos') return { nombre: suggestedLabel('Lazo', index), valor: 0 };
      if (fieldPath === 'hitos') return { texto: suggestedLabel('Aspecto Temporal', index) };
      if (fieldPath === 'complicaciones') return { texto: suggestedLabel('Complicación', index) };
      if (fieldPath === 'logros') return { texto: suggestedLabel('Hito', index) };
      if (fieldPath === 'inventario') return { texto: suggestedLabel('Objeto', index) };
      return { texto: suggestedLabel('Elemento', index) };
    };

    const trackSelectors = [
      '.distorsion .amordom-check input[type="checkbox"]',
      '.drama-checkboxes .amordom-check input[type="checkbox"]',
      '.extasis-checkboxes .amordom-check input[type="checkbox"]'
    ];
    const trackSelector = trackSelectors.join(', ');

    root.addEventListener('change', async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') return;
      if (!target.matches(trackSelector)) return;

      const group = target.closest('.distorsion, .drama-checkboxes, .extasis-checkboxes');
      if (!group) return;

      event.stopPropagation();

      const inputs = [...group.querySelectorAll('input[type="checkbox"]')];
      const selectedIndex = inputs.indexOf(target);
      if (selectedIndex < 0) return;

      const updateData = {};
      inputs.forEach((input, index) => {
        const checked = target.checked ? index <= selectedIndex : index < selectedIndex;
        input.checked = checked;
        const persistencePath = this._isBurnedMode && !input.name.startsWith('system.copia.')
          ? `system.copia${input.name.slice('system'.length)}`
          : input.name;
        foundry.utils.setProperty(updateData, persistencePath, checked);
      });

      await actor.update(updateData, { diff: false, render: false });
    });

    // Pestañas
    root.querySelectorAll('[data-tab-button]').forEach((button) => {
      if (button.dataset.adomBound === 'tab') return;
      button.dataset.adomBound = 'tab';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this._setTab(button.dataset.tabButton);
      });
    });

    const toggleBurnedMode = async () => {
      this._isBurnedMode = !this._isBurnedMode;
      this._activeTab = 'principal';
      this.element?.classList.toggle('burned-sheet', this._isBurnedMode);
      this._setSheetMode('principal');
      this._syncTemplateForMode();
      this.render({
        force: true,
        options: { backdrop: false }
      });
    };

    root.querySelectorAll('[data-open-burned-sheet]').forEach((button) => {
      if (button.dataset.adomBound === 'burned-sheet') return;
      button.dataset.adomBound = 'burned-sheet';
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await toggleBurnedMode();
      });
    });

    root.querySelectorAll('[data-toggle-main-sheet]').forEach((button) => {
      if (button.dataset.adomBound === 'toggle-main-sheet') return;
      button.dataset.adomBound = 'toggle-main-sheet';
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await toggleBurnedMode();
      });
    });

    root.querySelectorAll('[data-image-picker]').forEach((button) => {
      if (button.dataset.adomBound === 'image-picker') return;
      button.dataset.adomBound = 'image-picker';

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        new FilePicker({
          type: 'image',
          current: actor.img || '',
          callback: async (path) => {
            await actor.update({ img: path });
            this.render({ force: true, options: { backdrop: false } });
          },
          top: this.position?.top ?? 0,
          left: this.position?.left ?? 0
        }).render(true);
      });
    });

    root.querySelectorAll('[data-action]').forEach((button) => {
      const action = button.dataset.action;
      
      // FILTRO CRÍTICO: Si la acción no es "add-" ni "delete-", la ignoramos.
      // Esto permite que las acciones "close", "maximize" de Foundry funcionen sin interrupción.
      if (!action || (!action.startsWith('add-') && !action.startsWith('delete-'))) {
        return; 
      }

      if (button.dataset.adomBound === 'action') return;
      button.dataset.adomBound = 'action';
      
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const fieldKey = button.dataset.listKey;
        const fieldPath = fieldPathMap[fieldKey] ?? fieldKey;

        if (action.startsWith('add-')) {
          const current = getList(fieldPath);
          const nextItems = [...current, buildItem(fieldPath, current.length)];
          await persistList(fieldPath, nextItems);
          return;
        }

        if (action.startsWith('delete-')) {
          const row = button.closest('[data-row-index]');
          if (!row) return;
          const idx = Number(row.dataset.rowIndex);
          const current = getList(fieldPath);
          const nextItems = current.filter((_, i) => i !== idx);
          await persistList(fieldPath, nextItems);
        }
      });
    });
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const windowTitle = this.element?.querySelector('.window-title');
    if (windowTitle) windowTitle.textContent = this.document.name;
    const root = this.element;
    if (root) {
      root.classList.toggle('burned-sheet', !!this._isBurnedMode);
    }
    this._bindFormPersistence();
    this._bindInteractionHandlers();
    bindAttributeRolls(root, this.document, this._isBurnedMode);
    bindArcanaRolls(root, this.document, this._isBurnedMode);
    this._setSheetMode('principal');
    
    // Forzamos la sincronización de la pestaña activa en cada renderizado (incluyendo refrescos)
    const activeTab = this._activeTab ?? 'principal';
    this._setTab(activeTab);
  }
}

class AmorDomBurnedCharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    id: 'amordom-character-sheet-burned-{id}',
    classes: ['amordom', 'sheet', 'actor', 'burned-sheet'],
    position: {
      width: 850,
      height: 780
    },
    window: {
      title: 'Amor de Otro Mundo (Quemado)',
      icon: 'fa-solid fa-fire',
      resizable: true
    },
    form: {
      submitOnChange: false,
      closeOnSubmit: false
    }
  };

  static PARTS = {
    main: {
      template: 'systems/amordom/templates/actor/character-sheet-burned.hbs'
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.document;
    context.system = this.document.system;
    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const windowTitle = this.element?.querySelector('.window-title');
    if (windowTitle) windowTitle.textContent = this.document.name;
    if (this.element) {
      bindAttributeRolls(this.element, this.document, true);
      bindArcanaRolls(this.element, this.document, true);
    }
  }
}

Hooks.on('init', () => {
  // Registramos el TypeDataModel en el sistema
  CONFIG.Actor.dataModels.personaje = ActorPersonajeData;

  const DocumentSheetConfigApi = foundry.applications?.apps?.DocumentSheetConfig ?? globalThis.DocumentSheetConfig;
  if (!DocumentSheetConfigApi) {
    console.warn('Amor de Otro Mundo: no se encontró DocumentSheetConfig para registrar la ficha.');
    return;
  }

  // Registramos la hoja principal y la variante visual quemada.
  DocumentSheetConfigApi.registerSheet(Actor, 'amordom', AmorDomCharacterSheet, {
    types: ['personaje'],
    makeDefault: true,
    label: 'Amor de Otro Mundo'
  });

  DocumentSheetConfigApi.registerSheet(Actor, 'amordom-burned', AmorDomBurnedCharacterSheet, {
    types: ['personaje'],
    makeDefault: false,
    label: 'Amor de Otro Mundo (Quemado)'
  });
});

Hooks.on('ready', () => {
  console.log('Amor de Otro Mundo: sistema cargado y configurado exitosamente.');
});