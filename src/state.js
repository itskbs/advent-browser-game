const KEY = 'advent-wichteldorf-v1';

export function loadState(onChange) {
  let data = { solved: {}, eggs: {}, gift: false };
  try {
    data = { ...data, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch { /* kaputter oder blockierter Speicher: frisch starten */ }

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignorieren */ }
    onChange?.();
  };

  return {
    get solved() { return data.solved; },
    get eggs() { return data.eggs; },
    get gift() { return data.gift; },
    solve(day) { data.solved[day] = true; save(); },
    findEgg(id) { data.eggs[id] = true; save(); },
    openGift() { data.gift = true; save(); },
    reset() { data = { solved: {}, eggs: {}, gift: false }; save(); },
  };
}
