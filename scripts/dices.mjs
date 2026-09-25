const { DialogV2 } = foundry.applications.api;

const ATTRIBUTE_LABELS = {
  fuerza: 'Fuerza',
  destreza: 'Destreza',
  voluntad: 'Voluntad',
  percepcion: 'Percepción'
};

const SKILL_LABELS = {
  formaFisica: 'Forma Física',
  combate: 'Combate',
  percepcion: 'Percepción',
  subterfugio: 'Subterfugio',
  comunicacion: 'Comunicación',
  cultura: 'Cultura',
  ocultismo: 'Ocultismo',
  gestionEmocional: 'Gestión Emocional'
};

export function openAttributeRollDialog(actor, attribute, attributeValue) {
  const label = ATTRIBUTE_LABELS[attribute] ?? attribute;
  const value = Number(attributeValue) || 0;
  const skills = actor.system?.habilidades ?? {};
  const skillOptions = Object.entries(SKILL_LABELS)
    .map(([key, skillLabel], index) => `<option value="${key}"${index === 0 ? ' selected' : ''}>${skillLabel} (${Number(skills[key]) || 0})</option>`)
    .join('');

  const dialog = new DialogV2({
    classes: ['dialog', 'amordom', 'amordom-roll-dialog-window'],
    window: {
      title: `Tirada de ${label}`
    },
    content: `
      <form class="amordom-roll-dialog">
        <div class="amordom-roll-dialog__summary">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
        <fieldset class="amordom-roll-dialog__field amordom-roll-dialog__dice-field">
          <legend>Dados a sumar</legend>
          <div class="amordom-roll-dialog__dice-options">
            <label class="amordom-roll-dialog__heart-option">
              <input type="checkbox" name="dice" value="m" />
              <span class="amordom-roll-dialog__heart" aria-hidden="true">
                <img class="amordom-roll-dialog__heart-image heart-empty" src="systems/amordom/art/heart.png" alt="" />
                <img class="amordom-roll-dialog__heart-image heart-full" src="systems/amordom/art/heart full.png" alt="" />
                <strong>m</strong>
              </span>
            </label>
            <label class="amordom-roll-dialog__heart-option">
              <input type="checkbox" name="dice" value="c" checked />
              <span class="amordom-roll-dialog__heart" aria-hidden="true">
                <img class="amordom-roll-dialog__heart-image heart-empty" src="systems/amordom/art/heart.png" alt="" />
                <img class="amordom-roll-dialog__heart-image heart-full" src="systems/amordom/art/heart full.png" alt="" />
                <strong>C</strong>
              </span>
            </label>
            <label class="amordom-roll-dialog__heart-option">
              <input type="checkbox" name="dice" value="M" />
              <span class="amordom-roll-dialog__heart" aria-hidden="true">
                <img class="amordom-roll-dialog__heart-image heart-empty" src="systems/amordom/art/heart.png" alt="" />
                <img class="amordom-roll-dialog__heart-image heart-full" src="systems/amordom/art/heart full.png" alt="" />
                <strong>M</strong>
              </span>
            </label>
          </div>
        </fieldset>
        <label class="amordom-roll-dialog__field">
          <span>Habilidad</span>
          <select name="skill" required>
            <option value="">Selecciona una habilidad</option>
            ${skillOptions}
          </select>
        </label>
        <label class="amordom-roll-dialog__field">
          <span>Modificador</span>
          <input type="number" name="modifier" value="0" step="1" />
        </label>
      </form>
    `,
    buttons: [
      {
        action: 'roll',
        label: 'Lanzar dados',
        default: true,
        callback: async (_event, button) => {
          const form = button.closest('form') ?? button.closest('.window-content')?.querySelector('form.amordom-roll-dialog');
          if (!form) return;

          const selectedDice = [...form.querySelectorAll('[name="dice"]:checked')].map((input) => input.value);
          if (!selectedDice.length) {
            ui.notifications.warn('Selecciona al menos un dado.');
            return;
          }

          const skillKey = form.querySelector('[name="skill"]').value;
          if (!skillKey || !SKILL_LABELS[skillKey]) {
            ui.notifications.warn('Selecciona una habilidad.');
            return;
          }

          const skillValue = Number(skills[skillKey]) || 0;
          const modifier = Number(form.querySelector('[name="modifier"]').value) || 0;
          const roll = await new Roll(`3d10 + ${value} + ${skillValue}`).evaluate();
          const diceResults = roll.dice[0].results.map((result) => Number(result.result));
          const sortedDice = [...diceResults].sort((first, second) => first - second);
          const diceByType = { m: sortedDice[0], c: sortedDice[1], M: sortedDice[2] };
          const selectedTotal = selectedDice.reduce((total, dieType) => total + diceByType[dieType], 0);
          const ones = diceResults.filter((result) => result === 1).length;
          const tens = diceResults.filter((result) => result === 10).length;
          const resultStatus = ones >= 2
            ? '<div class="amordom-chat-roll__status amordom-chat-roll__status--fumble"><strong>Pifia</strong></div>'
            : tens >= 2
              ? '<div class="amordom-chat-roll__status amordom-chat-roll__status--critical"><strong>Crítico</strong></div>'
              : '';
          const selectedDiceMarkup = selectedDice.map((dieType) => {
            const dieLabel = dieType === 'c' ? 'C' : dieType;
            return `
              <span class="amordom-chat-roll__selected-die" title="Dado ${dieLabel} sumado">
                <img src="systems/amordom/art/heart full.png" alt="" />
                <b>${dieLabel}</b>
              </span>`;
          }).join('');
          const finalTotal = selectedTotal + value + skillValue + modifier;
          roll._total = finalTotal;

          await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor }),
            flavor: `
              <div class="amordom-chat-roll">
                <div class="amordom-chat-roll__header">
                  <div class="amordom-chat-roll__context">
                    <span>${label} ${value} + ${SKILL_LABELS[skillKey]} ${skillValue}</span>
                  </div>
                </div>
                <div class="amordom-chat-roll__dice">
                  <span class="amordom-chat-roll__die">
                    <img src="systems/amordom/art/heart.png" alt="" />
                    <b>m</b><strong>${diceByType.m}</strong>
                  </span>
                  <span class="amordom-chat-roll__die">
                    <img src="systems/amordom/art/heart.png" alt="" />
                    <b>C</b><strong>${diceByType.c}</strong>
                  </span>
                  <span class="amordom-chat-roll__die">
                    <img src="systems/amordom/art/heart.png" alt="" />
                    <b>M</b><strong>${diceByType.M}</strong>
                  </span>
                </div>
                ${resultStatus}
                <div class="amordom-chat-roll__details">
                  <span class="amordom-chat-roll__selected-dice" aria-label="Dados sumados">${selectedDiceMarkup}</span>
                  ${modifier ? `<span>Modificador: ${modifier}</span>` : ''}
                </div>
                <div class="amordom-chat-roll__total">
                  <span>Total de la tirada</span>
                  <strong>${finalTotal}</strong>
                </div>
              </div>`
          });
        }
      },
      {
        action: 'cancel',
        label: 'Cancelar',
        icon: 'fa-solid fa-xmark'
      }
    ]
  });

  const renderedDialog = dialog.render(true);
  Promise.resolve(renderedDialog).then((application) => {
    const element = application?.element ?? dialog.element;
    const root = element?.closest('.application') ?? element;
    const form = root?.querySelector('form.amordom-roll-dialog');
    if (!form || !root) return;

    const syncRollButton = () => {
      const rollButton = [...root.querySelectorAll('button')]
        .find((button) => button.dataset.action === 'roll' || button.textContent.trim().includes('Lanzar dados'));
      if (!rollButton) return;

      if (!rollButton.querySelector('.amordom-roll-dialog__button-icon')) {
        const rollIcon = document.createElement('img');
        rollIcon.className = 'amordom-roll-dialog__button-icon';
        rollIcon.src = 'systems/amordom/art/dice.png';
        rollIcon.alt = '';
        rollButton.prepend(rollIcon);
      }

      const hasSelectedDie = Boolean(form.querySelector('[name="dice"]:checked'));
      const skillKey = form.querySelector('[name="skill"]')?.value;
      const hasSelectedSkill = Boolean(skillKey && SKILL_LABELS[skillKey]);
      rollButton.disabled = !hasSelectedDie || !hasSelectedSkill;
    };

    form.addEventListener('change', (event) => {
      if (event.target.matches('[name="dice"], [name="skill"]')) syncRollButton();
    });
    syncRollButton();

    const buttonObserver = new MutationObserver(syncRollButton);
    buttonObserver.observe(root, { childList: true, subtree: true });
  });

  return renderedDialog;
}

export function bindAttributeRolls(root, actor) {
  root.querySelectorAll('.attribute-roll-button[data-roll-attribute]').forEach((field) => {
    if (field.dataset.adomBound === 'attribute-roll') return;
    field.dataset.adomBound = 'attribute-roll';
    field.addEventListener('click', (event) => {
      event.stopPropagation();
      openAttributeRollDialog(actor, field.dataset.rollAttribute, field.dataset.rollValue);
    });
  });
}

function escapeArcanaName(name) {
  return String(name ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

export function openArcanaRollDialog(actor, arcanaName, arcanaValue, isCopyMode = false, currentWillpower) {
  const willpower = Number(currentWillpower ?? (isCopyMode
    ? actor.system?.copia?.atributos?.voluntad
    : actor.system?.atributos?.voluntad)) || 0;
  const value = Number(arcanaValue) || 0;
  const baseTotal = willpower + value;
  const safeArcanaName = escapeArcanaName(arcanaName || 'Arcana');
  const dialog = new DialogV2({
    classes: ['dialog', 'amordom', 'amordom-roll-dialog-window'],
    window: {
      title: `Tirada de ${arcanaName || 'Arcana'}`
    },
    content: `
      <form class="amordom-roll-dialog amordom-roll-dialog--arcana">
        <div class="amordom-roll-dialog__summary amordom-roll-dialog__summary--arcana">
          <strong>Voluntad + ${safeArcanaName}</strong>
          <strong>${baseTotal}</strong>
        </div>
        <fieldset class="amordom-roll-dialog__field amordom-roll-dialog__dice-field">
          <legend>Dados a sumar</legend>
          <div class="amordom-roll-dialog__dice-options">
            <label class="amordom-roll-dialog__heart-option">
              <input type="checkbox" name="dice" value="m" />
              <span class="amordom-roll-dialog__heart" aria-hidden="true">
                <img class="amordom-roll-dialog__heart-image heart-empty" src="systems/amordom/art/heart.png" alt="" />
                <img class="amordom-roll-dialog__heart-image heart-full" src="systems/amordom/art/heart full.png" alt="" />
                <strong>m</strong>
              </span>
            </label>
            <label class="amordom-roll-dialog__heart-option">
              <input type="checkbox" name="dice" value="c" checked />
              <span class="amordom-roll-dialog__heart" aria-hidden="true">
                <img class="amordom-roll-dialog__heart-image heart-empty" src="systems/amordom/art/heart.png" alt="" />
                <img class="amordom-roll-dialog__heart-image heart-full" src="systems/amordom/art/heart full.png" alt="" />
                <strong>C</strong>
              </span>
            </label>
            <label class="amordom-roll-dialog__heart-option">
              <input type="checkbox" name="dice" value="M" />
              <span class="amordom-roll-dialog__heart" aria-hidden="true">
                <img class="amordom-roll-dialog__heart-image heart-empty" src="systems/amordom/art/heart.png" alt="" />
                <img class="amordom-roll-dialog__heart-image heart-full" src="systems/amordom/art/heart full.png" alt="" />
                <strong>M</strong>
              </span>
            </label>
          </div>
        </fieldset>
        <label class="amordom-roll-dialog__field">
          <span>Modificador</span>
          <input type="number" name="modifier" value="0" step="1" />
        </label>
      </form>
    `,
    buttons: [
      {
        action: 'roll',
        label: 'Lanzar dados',
        default: true,
        callback: async (_event, button) => {
          const form = button.closest('form') ?? button.closest('.window-content')?.querySelector('form.amordom-roll-dialog');
          if (!form) return;

          const selectedDice = [...form.querySelectorAll('[name="dice"]:checked')].map((input) => input.value);
          if (!selectedDice.length) {
            ui.notifications.warn('Selecciona al menos un dado.');
            return;
          }

          const modifier = Number(form.querySelector('[name="modifier"]').value) || 0;
          const roll = await new Roll('3d10').evaluate();
          const diceResults = roll.dice[0].results.map((result) => Number(result.result));
          const sortedDice = [...diceResults].sort((first, second) => first - second);
          const diceByType = { m: sortedDice[0], c: sortedDice[1], M: sortedDice[2] };
          const selectedTotal = selectedDice.reduce((total, dieType) => total + diceByType[dieType], 0);
          const ones = diceResults.filter((result) => result === 1).length;
          const tens = diceResults.filter((result) => result === 10).length;
          const resultStatus = ones >= 2
            ? '<div class="amordom-chat-roll__status amordom-chat-roll__status--fumble"><strong>Pifia</strong></div>'
            : tens >= 2
              ? '<div class="amordom-chat-roll__status amordom-chat-roll__status--critical"><strong>Crítico</strong></div>'
              : '';
          const selectedDiceMarkup = selectedDice.map((dieType) => {
            const dieLabel = dieType === 'c' ? 'C' : dieType;
            return `
              <span class="amordom-chat-roll__selected-die" title="Dado ${dieLabel} sumado">
                <img src="systems/amordom/art/heart full.png" alt="" />
                <b>${dieLabel}</b>
              </span>`;
          }).join('');
          const finalTotal = selectedTotal + baseTotal + modifier;
          roll._total = finalTotal;

          await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor }),
            flavor: `
              <div class="amordom-chat-roll">
                <div class="amordom-chat-roll__header">
                  <div class="amordom-chat-roll__context">
                    <span>Voluntad ${willpower} + ${safeArcanaName} ${value}</span>
                  </div>
                </div>
                <div class="amordom-chat-roll__dice">
                  <span class="amordom-chat-roll__die">
                    <img src="systems/amordom/art/heart.png" alt="" />
                    <b>m</b><strong>${diceByType.m}</strong>
                  </span>
                  <span class="amordom-chat-roll__die">
                    <img src="systems/amordom/art/heart.png" alt="" />
                    <b>C</b><strong>${diceByType.c}</strong>
                  </span>
                  <span class="amordom-chat-roll__die">
                    <img src="systems/amordom/art/heart.png" alt="" />
                    <b>M</b><strong>${diceByType.M}</strong>
                  </span>
                </div>
                ${resultStatus}
                <div class="amordom-chat-roll__details">
                  <span class="amordom-chat-roll__selected-dice" aria-label="Dados sumados">${selectedDiceMarkup}</span>
                  ${modifier ? `<span>Modificador: ${modifier}</span>` : ''}
                </div>
                <div class="amordom-chat-roll__total">
                  <span>Total de la tirada</span>
                  <strong>${finalTotal}</strong>
                </div>
              </div>`
          });
        }
      },
      {
        action: 'cancel',
        label: 'Cancelar',
        icon: 'fa-solid fa-xmark'
      }
    ]
  });

  const renderedDialog = dialog.render(true);
  Promise.resolve(renderedDialog).then((application) => {
    const element = application?.element ?? dialog.element;
    const root = element?.closest('.application') ?? element;
    const form = root?.querySelector('form.amordom-roll-dialog');
    if (!form || !root) return;

    const syncRollButton = () => {
      const rollButton = [...root.querySelectorAll('button')]
        .find((button) => button.dataset.action === 'roll' || button.textContent.trim().includes('Lanzar dados'));
      if (!rollButton) return;

      if (!rollButton.querySelector('.amordom-roll-dialog__button-icon')) {
        const rollIcon = document.createElement('img');
        rollIcon.className = 'amordom-roll-dialog__button-icon';
        rollIcon.src = 'systems/amordom/art/dice.png';
        rollIcon.alt = '';
        rollButton.prepend(rollIcon);
      }

      rollButton.disabled = !form.querySelector('[name="dice"]:checked');
    };

    form.addEventListener('change', syncRollButton);
    syncRollButton();
    new MutationObserver(syncRollButton).observe(root, { childList: true, subtree: true });
  });

  return renderedDialog;
}

export function bindArcanaRolls(root, actor, isCopyMode = false) {
  root.querySelectorAll('.arcana-roll-button').forEach((button) => {
    if (button.dataset.adomBound === 'arcana-roll') return;
    button.dataset.adomBound = 'arcana-roll';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const row = button.closest('.arcana-row');
      const name = row?.querySelector('.arma-ataque-nombre')?.value?.trim();
      const value = row?.querySelector('.arma-ataque-dmg')?.value;
      const willpower = root.querySelector('[name="system.atributos.voluntad"]')?.value;
      openArcanaRollDialog(actor, name, value, isCopyMode, willpower);
    });
  });
}
