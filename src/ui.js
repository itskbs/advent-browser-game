// Dialogfeld im SNES-Stil: say / choose / ask liefern Promises.
export function createUI() {
  const $ = (id) => document.getElementById(id);
  const dlg = $('dialog'), speakerEl = $('speaker'), textEl = $('text'), letterEl = $('letter');
  const choicesEl = $('choices'), answerEl = $('answer'), hintEl = $('hint'), toastEl = $('toast');

  let mode = null;      // null | 'say' | 'choose' | 'ask'
  let typed = false;    // Text ist fertig getippt
  let typing = null, full = '', onTyped = null;
  let resolveFn = null, options = [], sel = 0, toastTimer = null;

  function finishTyping() {
    clearInterval(typing); typing = null;
    textEl.textContent = full;
    typed = true;
    const f = onTyped; onTyped = null; f?.();
  }

  function open(speaker, text, letter, after) {
    dlg.hidden = false;
    speakerEl.textContent = speaker || ''; speakerEl.hidden = !speaker;
    letterEl.hidden = !letter; letterEl.textContent = letter || '';
    choicesEl.hidden = true; answerEl.hidden = true; hintEl.hidden = true;
    typed = false; full = text; onTyped = after;
    textEl.textContent = '';
    let n = 0;
    clearInterval(typing);
    typing = setInterval(() => { textEl.textContent = full.slice(0, ++n); if (n >= full.length) finishTyping(); }, 18);
  }

  function close(value) {
    const r = resolveFn; resolveFn = null; mode = null;
    dlg.hidden = true; answerEl.blur();
    r(value);
  }

  function renderChoices() {
    choicesEl.replaceChildren(...options.map((o, i) => {
      const li = document.createElement('li');
      li.textContent = o;
      li.className = i === sel ? 'sel' : '';
      li.addEventListener('click', () => { if (mode === 'choose' && typed) close(i); });
      li.addEventListener('mouseenter', () => { if (mode === 'choose' && sel !== i) { sel = i; renderChoices(); } });
      return li;
    }));
  }

  dlg.addEventListener('click', (e) => { if (mode === 'say' && e.target !== answerEl) handleKey({ key: 'Enter', preventDefault() {} }); });

  function handleKey(e) {
    if (e.repeat) return;
    const k = e.key;
    const isOk = k === 'Enter' || k === ' ' || k === 'e' || k === 'E';
    if (!typed) { if (isOk || k === 'Escape') { e.preventDefault(); finishTyping(); } return; }

    if (mode === 'say') {
      if (isOk) { e.preventDefault(); close(); }
    } else if (mode === 'choose') {
      if (k === 'ArrowUp' || k === 'w') { sel = (sel + options.length - 1) % options.length; renderChoices(); e.preventDefault(); }
      else if (k === 'ArrowDown' || k === 's') { sel = (sel + 1) % options.length; renderChoices(); e.preventDefault(); }
      else if (isOk) { e.preventDefault(); close(sel); }
      else if (k === 'Escape') { e.preventDefault(); close(options.length - 1); }
      else if (/^[1-9]$/.test(k) && +k <= options.length) { e.preventDefault(); close(+k - 1); }
    } else if (mode === 'ask') {
      if (k === 'Enter') { e.preventDefault(); close(answerEl.value.trim()); }
      else if (k === 'Escape') { e.preventDefault(); close(null); }
    }
  }

  return {
    get active() { return mode !== null; },
    handleKey,

    say(speaker, text, { letter } = {}) {
      return new Promise((res) => {
        mode = 'say'; resolveFn = res;
        open(speaker, text, letter, () => { hintEl.hidden = false; });
      });
    },

    // resolves with the chosen index; Esc picks the last option
    choose(speaker, text, opts) {
      return new Promise((res) => {
        mode = 'choose'; resolveFn = res; options = opts; sel = 0;
        open(speaker, text, null, () => { renderChoices(); choicesEl.hidden = false; });
      });
    },

    // resolves with the typed string, or null on Esc
    ask(speaker, text) {
      return new Promise((res) => {
        mode = 'ask'; resolveFn = res;
        open(speaker, text, null, () => { answerEl.hidden = false; answerEl.value = ''; answerEl.focus(); });
      });
    },

    toast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
    },
  };
}
