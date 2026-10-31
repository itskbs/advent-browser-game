// Spielstand liegt jetzt serverseitig (siehe api/progress.js), nicht mehr in localStorage.
// loadState lädt ihn einmal beim Start; solve/findEgg/openGift aktualisieren sofort lokal
// (für ein reaktionsschnelles HUD) und synchronisieren im Hintergrund mit dem Server.

export async function loadState(onChange) {
  let data = { solved: {}, eggs: {}, gift: false };
  try {
    const res = await fetch('/api/progress');
    if (res.ok) data = { ...data, ...(await res.json()) };
  } catch { /* offline: mit leerem Fortschritt starten */ }

  const sync = (body) => {
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => { /* bestmöglich, kein Retry nötig für dieses Spiel */ });
  };

  return {
    get solved() { return data.solved; },
    get eggs() { return data.eggs; },
    get gift() { return data.gift; },
    solve(day) {
      if (data.solved[day]) return;
      data.solved[day] = true;
      onChange?.();
      sync({ action: 'solve', day });
    },
    findEgg(id) {
      if (data.eggs[id]) return;
      data.eggs[id] = true;
      onChange?.();
      sync({ action: 'egg', id });
    },
    openGift() {
      if (data.gift) return;
      data.gift = true;
      onChange?.();
      sync({ action: 'gift' });
    },
    reset() {
      data = { solved: {}, eggs: {}, gift: false };
      onChange?.();
      sync({ action: 'reset' });
    },
  };
}
