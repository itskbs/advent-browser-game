// Dialogfeld im SNES-Stil: say / choose / ask / sudokuBoard / chessBoard liefern Promises.
const CHESS_SYMBOLS = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

export function createUI() {
  const $ = (id) => document.getElementById(id);
  const dlg = $('dialog'), speakerEl = $('speaker'), textEl = $('text'), letterEl = $('letter');
  const choicesEl = $('choices'), answerEl = $('answer'), boardEl = $('board'), hintEl = $('hint'), toastEl = $('toast');

  let mode = null;      // null | 'say' | 'choose' | 'ask' | 'sudoku' | 'chess'
  let typed = false;    // Text ist fertig getippt
  let typing = null, full = '', onTyped = null;
  let resolveFn = null, options = [], sel = 0, toastTimer = null;
  let sudokuState = null;   // { puzzle, solution-unabhängig, values, size, box, sel }
  let chessState = null;    // { board, legal, selected }
  let chessPickResolve = null;

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
    boardEl.hidden = true; boardEl.replaceChildren(); // zombie cells would keep stale click listeners alive
    typed = false; full = text; onTyped = after;
    textEl.textContent = '';
    let n = 0;
    clearInterval(typing);
    typing = setInterval(() => { textEl.textContent = full.slice(0, ++n); if (n >= full.length) finishTyping(); }, 18);
  }

  function close(value) {
    const r = resolveFn; resolveFn = null; mode = null;
    sudokuState = null; chessState = null; chessPickResolve = null;
    dlg.hidden = true; answerEl.blur();
    boardEl.hidden = true; boardEl.replaceChildren();
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

  // --- Sudoku-Board ---
  function sudokuStep(r, c, dr, dc) {
    const { size, puzzle } = sudokuState;
    for (;;) {
      r += dr; c += dc;
      if (r < 0 || r >= size || c < 0 || c >= size) return null;
      if (puzzle[r][c] === 0) return [r, c];
    }
  }

  function renderSudoku() {
    if (!sudokuState) return;
    const { puzzle, values, size, box, sel: cur } = sudokuState;
    boardEl.className = 'sudoku-board';
    boardEl.style.setProperty('--size', size);
    boardEl.style.setProperty('--cell', (size <= 4 ? 56 : 32) + 'px');
    boardEl.replaceChildren();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const given = puzzle[r][c] !== 0;
        const cell = document.createElement('div');
        cell.className = 'cell ' + (given ? 'given' : 'blank');
        if (c % box === 0) cell.classList.add('edge-left');
        if (r % box === 0) cell.classList.add('edge-top');
        if (c === size - 1) cell.classList.add('edge-right');
        if (r === size - 1) cell.classList.add('edge-bottom');
        if (!given && cur && cur[0] === r && cur[1] === c) cell.classList.add('sel');
        const val = given ? puzzle[r][c] : values[r][c];
        cell.textContent = val ? String(val) : '';
        if (!given) cell.addEventListener('click', () => { sudokuState.sel = [r, c]; renderSudoku(); });
        boardEl.appendChild(cell);
      }
    }
  }

  // --- Chess-Board ---
  function renderChess() {
    const st = chessState;
    if (!st) return;
    const { board, legal, selected } = st;
    boardEl.className = 'chess-board';
    boardEl.style.setProperty('--cell', '42px');
    boardEl.replaceChildren();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        sq.className = 'sq ' + ((r + c) % 2 ? 'dark' : 'light');
        if (selected && selected[0] === r && selected[1] === c) sq.classList.add('selected');
        if (legal.has(r * 8 + c)) sq.classList.add('legal');
        const piece = board[r][c];
        if (piece) {
          sq.textContent = CHESS_SYMBOLS[piece];
          sq.classList.add(piece[0] === 'w' ? 'white-piece' : 'black-piece');
        }
        sq.addEventListener('click', () => {
          if (chessPickResolve) { const res = chessPickResolve; chessPickResolve = null; res([r, c]); }
        });
        boardEl.appendChild(sq);
      }
    }
  }

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
    } else if (mode === 'sudoku') {
      const st = sudokuState;
      if (k === 'Escape') { e.preventDefault(); close(null); }
      else if (k === 'Enter') { e.preventDefault(); close(st.values.map((row) => row.slice())); }
      else if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); if (st.sel) { const n = sudokuStep(st.sel[0], st.sel[1], -1, 0); if (n) { st.sel = n; renderSudoku(); } } }
      else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); if (st.sel) { const n = sudokuStep(st.sel[0], st.sel[1], 1, 0); if (n) { st.sel = n; renderSudoku(); } } }
      else if (k === 'ArrowLeft' || k === 'a' || k === 'A') { e.preventDefault(); if (st.sel) { const n = sudokuStep(st.sel[0], st.sel[1], 0, -1); if (n) { st.sel = n; renderSudoku(); } } }
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') { e.preventDefault(); if (st.sel) { const n = sudokuStep(st.sel[0], st.sel[1], 0, 1); if (n) { st.sel = n; renderSudoku(); } } }
      else if (/^[0-9]$/.test(k) && st.sel) {
        e.preventDefault();
        const d = +k;
        if (d === 0 || d <= st.size) { st.values[st.sel[0]][st.sel[1]] = d; renderSudoku(); }
      } else if ((k === 'Backspace' || k === 'Delete') && st.sel) {
        e.preventDefault(); st.values[st.sel[0]][st.sel[1]] = 0; renderSudoku();
      }
    } else if (mode === 'chess') {
      if (k === 'Escape' && chessPickResolve) { e.preventDefault(); const res = chessPickResolve; chessPickResolve = null; res(null); }
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

    // Editierbares Sudoku-Raster. puzzle: size x size, 0 = Lücke. values (optional): vorheriger Spielstand
    // (damit Fortschritt bei einer falschen Lösung erhalten bleibt). Resolves mit dem vollen Raster (Enter)
    // oder null (Esc).
    sudokuBoard(speaker, text, puzzle, values) {
      return new Promise((res) => {
        mode = 'sudoku'; resolveFn = res;
        const size = puzzle.length;
        const box = Number.isInteger(Math.sqrt(size)) ? Math.sqrt(size) : size;
        let firstBlank = null;
        for (let r = 0; r < size && !firstBlank; r++) for (let c = 0; c < size && !firstBlank; c++) if (puzzle[r][c] === 0) firstBlank = [r, c];
        sudokuState = {
          puzzle, size, box, sel: firstBlank,
          values: values ? values.map((row) => row.slice()) : puzzle.map((row) => row.map(() => 0)),
        };
        open(speaker, text, null, () => { boardEl.hidden = false; renderSudoku(); });
      });
    },

    // Interaktives Schachbrett. Löst (nach dem Tippeffekt) zu einem Controller auf:
    //   render(board, legalSquares, selected) – Stellung + Hervorhebungen neu zeichnen
    //   pick() – Promise, löst mit [row, col] des nächsten Klicks auf, oder null bei Esc
    //   close() – Dialog schließen
    chessBoard(speaker, text) {
      return new Promise((res) => {
        mode = 'chess';
        open(speaker, text, null, () => {
          boardEl.hidden = false;
          res({
            render(board, legalSquares = [], selected = null) {
              chessState = { board, legal: new Set(legalSquares.map(([r, c]) => r * 8 + c)), selected };
              renderChess();
            },
            pick() { return new Promise((pickRes) => { chessPickResolve = pickRes; }); },
            close() {
              chessPickResolve = null; chessState = null; mode = null;
              dlg.hidden = true; boardEl.hidden = true; boardEl.replaceChildren();
            },
          });
        });
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
