/**
 * Vehicle Number Generator • 4-Digit Numbers (0000–9999)
 * Typographic Roles:
 * - Number Display: Space Mono (Structural, zero layout shift)
 * - UI & Labels: Instrument Sans (Clean, invisible legibility)
 * - Accent & Data: Roboto Mono (Technical without noise)
 */

(() => {
  // --- DOM Elements ---
  const keypadKeys = document.querySelectorAll('.keypad-key');
  const digitInput = document.getElementById('digitInput');
  const poolBadge = document.getElementById('poolBadge');
  const digitCards = [
    document.getElementById('card0'),
    document.getElementById('card1'),
    document.getElementById('card2'),
    document.getElementById('card3')
  ];
  const generateBtn = document.getElementById('generateBtn');
  const generateBatchBtn = document.getElementById('generateBatchBtn');
  const copyBtn = document.getElementById('copyBtn');
  const copyLabel = copyBtn ? copyBtn.querySelector('.copy-label') : null;
  const exploreAllBtn = document.getElementById('exploreAllBtn');
  const matchBadge = document.getElementById('matchBadge');
  const stepsFlow = document.getElementById('stepsFlow');
  const batchSection = document.getElementById('batchSection');
  const batchGrid = document.getElementById('batchGrid');
  const batchTargetNum = document.getElementById('batchTargetNum');
  const closeBatchBtn = document.getElementById('closeBatchBtn');
  const historyList = document.getElementById('historyList');
  const historyCount = document.getElementById('historyCount');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const toast = document.getElementById('toast');

  // Modal elements
  const modalOverlay = document.getElementById('modalOverlay');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalSearch = document.getElementById('modalSearch');
  const numbersScrollBox = document.getElementById('numbersScrollBox');
  const modalPickRandomBtn = document.getElementById('modalPickRandomBtn');

  // --- State ---
  let currentTarget = 8;
  let currentNumber = '9998';
  let isRolling = false;
  let history = [];

  // --- Mathematical Engine ---

  /**
   * Calculates repeated digit sum and full breakdown steps.
   * e.g., '9998' -> Step 1: 9 + 9 + 9 + 8 = 35 -> Step 2: 3 + 5 = 8
   */
  function calculateDigitalRoot(numStr) {
    const digits = numStr.split('').map(Number);

    // Edge case: '0000'
    if (digits.every(d => d === 0)) {
      return {
        finalTotal: 0,
        steps: [{ expr: digits.join(' + '), sum: 0 }]
      };
    }

    const steps = [];
    let currentSum = digits.reduce((acc, val) => acc + val, 0);
    steps.push({
      expr: digits.join(' + '),
      sum: currentSum
    });

    while (currentSum >= 10) {
      const nextDigits = String(currentSum).split('').map(Number);
      currentSum = nextDigits.reduce((acc, val) => acc + val, 0);
      steps.push({
        expr: nextDigits.join(' + '),
        sum: currentSum
      });
    }

    return {
      finalTotal: currentSum,
      steps
    };
  }

  /**
   * Generates a uniform random 4-digit number whose repeated digit sum equals target.
   * Formula: target + 9 * k for k in [0..1110] (1,111 unique solutions for 1..9, '0000' for 0).
   */
  function generateRandomNumber(target) {
    if (target === 0) return '0000';
    const k = Math.floor(Math.random() * 1111);
    const val = target + 9 * k;
    return String(val).padStart(4, '0');
  }

  /**
   * Returns all matching numbers for a given target.
   */
  function getAllMatchingNumbers(target) {
    if (target === 0) return ['0000'];
    const results = [];
    for (let k = 0; k < 1111; k++) {
      results.push(String(target + 9 * k).padStart(4, '0'));
    }
    return results;
  }

  // --- UI Updates ---

  function setTarget(target) {
    target = Math.max(0, Math.min(9, Number(target)));
    currentTarget = target;
    digitInput.value = target;

    // Segmented dial state
    keypadKeys.forEach(key => {
      key.classList.toggle('active', Number(key.dataset.digit) === target);
    });

    // Pool description
    if (target === 0) {
      poolBadge.textContent = 'Only 0000 adds up to 0';
    } else {
      poolBadge.textContent = '1,111 vehicle numbers match this sum';
    }
  }

  function renderSteps(numStr) {
    const { finalTotal, steps } = calculateDigitalRoot(numStr);
    matchBadge.textContent = `Total: ${finalTotal}`;

    let html = '';
    steps.forEach((step, index) => {
      const isFinal = index === steps.length - 1;
      const stepNote = (steps.length > 1 && isFinal) ? ' &mdash; matches your chosen sum!' : '';
      html += `
        <div class="derivation-line">
          <span class="derivation-step">Step ${index + 1}</span>
          <span class="derivation-calc">${step.expr} = <strong>${step.sum}</strong>${stepNote}</span>
        </div>
      `;
    });

    stepsFlow.innerHTML = html;
  }

  function getDigitElement(card) {
    return card.querySelector('.digit-glyph') || card.querySelector('.digit-val');
  }

  function displayDigits(numStr, animate = true) {
    currentNumber = numStr;
    const digits = numStr.split('');

    if (!animate) {
      digitCards.forEach((card, idx) => {
        getDigitElement(card).textContent = digits[idx];
      });
      renderSteps(numStr);
      return;
    }

    if (isRolling) return;
    isRolling = true;
    generateBtn.disabled = true;

    // Zero-shift jitter / roll animation
    digitCards.forEach(card => card.classList.add('rolling'));

    const rollInterval = setInterval(() => {
      digitCards.forEach(card => {
        getDigitElement(card).textContent = Math.floor(Math.random() * 10);
      });
    }, 45);

    setTimeout(() => {
      clearInterval(rollInterval);
      digitCards.forEach((card, idx) => {
        card.classList.remove('rolling');
        getDigitElement(card).textContent = digits[idx];
      });
      renderSteps(numStr);
      addToHistory(numStr, currentTarget);
      isRolling = false;
      generateBtn.disabled = false;
    }, 320);
  }

  function addToHistory(numStr, target) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    history.unshift({ numStr, target, timeStr });
    if (history.length > 30) history.pop();
    renderHistory();
  }

  function renderHistory() {
    if (historyCount) {
      historyCount.textContent = `${history.length} ${history.length === 1 ? 'number' : 'numbers'}`;
    }

    if (history.length === 0) {
      historyList.innerHTML = `<div class="ledger-empty">No numbers generated yet. Click "Generate Vehicle Number" to try one!</div>`;
      return;
    }

    historyList.innerHTML = history.map((item, index) => `
      <div class="ledger-row">
        <div class="ledger-data">
          <span class="ledger-num">${item.numStr}</span>
          <span class="ledger-target">Sum: ${item.target}</span>
          <span class="ledger-time">${item.timeStr}</span>
        </div>
        <button class="ledger-copy-trigger" data-index="${index}" title="Copy number">Copy</button>
      </div>
    `).join('');

    historyList.querySelectorAll('.ledger-copy-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.dataset.index);
        copyToClipboard(history[idx].numStr);
      });
    });
  }

  function generateBatch() {
    const numbers = [];
    const pool = getAllMatchingNumbers(currentTarget);

    if (currentTarget === 0) {
      numbers.push('0000');
    } else {
      const picked = new Set();
      while (picked.size < Math.min(5, pool.length)) {
        const randIdx = Math.floor(Math.random() * pool.length);
        picked.add(randIdx);
      }
      picked.forEach(idx => numbers.push(pool[idx]));
    }

    batchTargetNum.textContent = currentTarget;
    batchGrid.innerHTML = numbers.map(num => `
      <div class="batch-card" data-num="${num}">
        <div class="batch-num">${num}</div>
        <div class="batch-hint">Click to view</div>
      </div>
    `).join('');

    batchSection.classList.remove('hidden');

    batchGrid.querySelectorAll('.batch-card').forEach(card => {
      card.addEventListener('click', () => {
        const selected = card.dataset.num;
        displayDigits(selected, false);
        showToast(`Loaded ${selected}`);
      });
    });
  }

  function copyToClipboard(text) {
    const onCopied = () => {
      showToast(`Copied ${text} to clipboard!`);
      if (copyLabel) {
        const originalText = copyLabel.textContent;
        copyLabel.textContent = 'Copied!';
        setTimeout(() => {
          copyLabel.textContent = originalText;
        }, 1500);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onCopied).catch(() => fallbackCopy(text, onCopied));
    } else {
      fallbackCopy(text, onCopied);
    }
  }

  function fallbackCopy(text, callback) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    if (callback) callback();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2000);
  }

  // --- Modal Dialog ---

  let currentModalMatches = [];

  function openExploreModal() {
    currentModalMatches = getAllMatchingNumbers(currentTarget);
    modalTitle.textContent = `All Vehicle Numbers That Add Up to ${currentTarget}`;
    modalSubtitle.textContent = `${currentModalMatches.length} matching numbers between 0000 and 9999`;
    modalSearch.value = '';
    renderModalList(currentModalMatches);
    modalOverlay.classList.remove('hidden');
    modalSearch.focus();
  }

  function renderModalList(list) {
    if (list.length === 0) {
      numbersScrollBox.innerHTML = `<div class="ledger-empty" style="grid-column: 1/-1;">No numbers match your search.</div>`;
      return;
    }

    const displayed = list.slice(0, 420);
    numbersScrollBox.innerHTML = displayed.map(num => `
      <button class="catalog-pill" data-num="${num}">${num}</button>
    `).join('') + (list.length > 420 ? `<div style="grid-column: 1/-1; text-align: center; color: var(--ink-tertiary); font-size: 0.75rem; padding: 10px;">+ ${list.length - 420} more numbers (use the search bar above to find specific ones)</div>` : '');

    numbersScrollBox.querySelectorAll('.catalog-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const val = pill.dataset.num;
        displayDigits(val, false);
        modalOverlay.classList.add('hidden');
        showToast(`Loaded ${val}`);
      });
    });
  }

  function filterModalList() {
    const query = modalSearch.value.trim();
    if (!query) {
      renderModalList(currentModalMatches);
      return;
    }
    const filtered = currentModalMatches.filter(n => n.includes(query));
    renderModalList(filtered);
  }

  // --- Theme Management ---

  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  // --- Event Listeners ---

  // Keypad keys
  keypadKeys.forEach(key => {
    key.addEventListener('click', () => {
      const digit = Number(key.dataset.digit);
      setTarget(digit);
      const newNum = generateRandomNumber(digit);
      displayDigits(newNum, true);
    });
  });

  // Direct digit input
  digitInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val !== '' && !isNaN(val)) {
      setTarget(Number(val));
    }
  });

  digitInput.addEventListener('change', () => {
    const newNum = generateRandomNumber(currentTarget);
    displayDigits(newNum, true);
  });

  // Action Buttons
  generateBtn.addEventListener('click', () => {
    const num = generateRandomNumber(currentTarget);
    displayDigits(num, true);
  });

  generateBatchBtn.addEventListener('click', generateBatch);

  copyBtn.addEventListener('click', () => {
    copyToClipboard(currentNumber);
  });

  exploreAllBtn.addEventListener('click', openExploreModal);

  closeBatchBtn.addEventListener('click', () => {
    batchSection.classList.add('hidden');
  });

  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    renderHistory();
    showToast('List cleared');
  });

  themeToggleBtn.addEventListener('click', toggleTheme);

  // Modal interactions
  closeModalBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.add('hidden');
    }
  });

  modalSearch.addEventListener('input', filterModalList);

  modalPickRandomBtn.addEventListener('click', () => {
    const num = generateRandomNumber(currentTarget);
    displayDigits(num, false);
    modalOverlay.classList.add('hidden');
    showToast(`Loaded ${num}`);
  });

  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (e.target === digitInput || e.target === modalSearch) return;

    if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
      modalOverlay.classList.add('hidden');
      return;
    }

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      generateBtn.click();
    }
  });

  // Initialize
  initTheme();
  setTarget(8);
  displayDigits('9998', false);
})();
