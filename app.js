/**
 * Language Intake MVP v0.1.2 — App Controller (Scribe Conformance Patch)
 * Wires the engine to the DOM. No external dependencies.
 */

(function () {
  const engine = window.LanguageIntakeEngine;

  // DOM elements
  const inputSection = document.getElementById('step-input');
  const resultSection = document.getElementById('step-result');
  const textarea = document.getElementById('language-input');
  const contextSelect = document.getElementById('context-select');
  const inspectBtn = document.getElementById('inspect-btn');
  const resetBtn = document.getElementById('reset-btn');
  const resultContainer = document.getElementById('result-container');
  const relianceSection = document.getElementById('reliance-section');
  const reliancePromptText = document.getElementById('reliance-prompt-text');
  const relianceOptions = document.getElementById('reliance-options');
  const routeSection = document.getElementById('route-section');
  const routeBox = document.getElementById('route-box');

  let currentResult = null;

  // ─── Enable/disable inspect button ─────────────────────────────────
  textarea.addEventListener('input', () => {
    inspectBtn.disabled = textarea.value.trim().length === 0;
  });

  // ─── Run Inspection ────────────────────────────────────────────────
  inspectBtn.addEventListener('click', () => {
    const rawText = textarea.value.trim();
    if (!rawText) return;

    const context = contextSelect.value;
    currentResult = engine.evaluateLanguage(rawText, context);

    renderResult(currentResult);
    inputSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
  });

  // ─── Reset ─────────────────────────────────────────────────────────
  resetBtn.addEventListener('click', () => {
    textarea.value = '';
    inspectBtn.disabled = true;
    resultContainer.innerHTML = '';
    relianceSection.classList.add('hidden');
    routeSection.classList.add('hidden');
    relianceOptions.innerHTML = '';
    routeBox.innerHTML = '';
    resultSection.classList.add('hidden');
    inputSection.classList.remove('hidden');
    currentResult = null;
    textarea.focus();
  });

  // ─── Render Result ─────────────────────────────────────────────────
  function renderResult(result) {
    let html = '';

    if (result.admission_status === 'constitutional_non_admission') {
      html += renderNonAdmission(result);
    } else if (result.admission_status === 'scribe_mark') {
      html += renderScribeMark(result);
    } else {
      html += renderNoMark(result);
    }

    // Secondary risk notes (if any)
    if (result.secondary_risk_rules && result.secondary_risk_rules.length > 0) {
      html += `<div class="secondary-risks">`;
      html += `<h4>Secondary Risk Signals (Brian Shield)</h4>`;
      html += `<ul>`;
      for (const r of result.secondary_risk_rules) {
        html += `<li><code>${r.id}</code> ${r.name}</li>`;
      }
      html += `</ul>`;
      html += `</div>`;
    }

    // Technical details
    html += `<details class="details-panel">`;
    html += `  <summary>Technical details</summary>`;
    html += `  <div class="detail-row"><span class="detail-key">Admission Status</span><span class="detail-value">${result.admission_status}</span></div>`;
    html += `  <div class="detail-row"><span class="detail-key">Constitutional Category</span><span class="detail-value">${result.constitutional_category || '—'}</span></div>`;
    html += `  <div class="detail-row"><span class="detail-key">Scribe Crossing Type</span><span class="detail-value">${result.scribe_crossing_type || '—'}</span></div>`;
    html += `  <div class="detail-row"><span class="detail-key">Risk Level</span><span class="detail-value">${result.risk_level}</span></div>`;
    html += `  <div class="detail-row"><span class="detail-key">Recommended Route</span><span class="detail-value">${result.recommended_route}</span></div>`;
    html += `  <div class="detail-row"><span class="detail-key">Reliance Question Required</span><span class="detail-value">${result.reliance_question_required}</span></div>`;
    html += `  <div class="detail-row"><span class="detail-key">Timestamp</span><span class="detail-value">${result.timestamp}</span></div>`;
    if (result.triggered_invariants && result.triggered_invariants.length > 0) {
      html += `  <div class="detail-row"><span class="detail-key">Triggered Invariants</span><span class="detail-value">${result.triggered_invariants.map(i => i.id).join(', ')}</span></div>`;
    }
    html += `</details>`;

    resultContainer.innerHTML = html;

    // Show reliance question for Scribe Mark results
    if (result.reliance_question_required) {
      showRelianceQuestion(result);
    } else {
      // Show route directly for Non-Admission and No Mark
      showRoute(result, null);
    }
  }

  // ─── Constitutional Non-Admission (structurally distinct) ──────────
  function renderNonAdmission(result) {
    let html = '';
    html += `<div class="non-admission-banner">`;
    html += `  <div class="non-admission-icon">&#x26D4;</div>`;
    html += `  <div class="non-admission-title">Constitutional Non-Admission</div>`;
    html += `  <div class="non-admission-body">`;
    html += `    <p class="non-admission-primary">This category is outside admissible system participation.</p>`;
    html += `    <p class="non-admission-secondary">Private meaning remains yours. The system may not define, validate, develop, or soften this category into admissible participation.</p>`;
    html += `  </div>`;
    html += `  <div class="non-admission-category">`;
    html += `    <span class="category-label">Category:</span> ${result.constitutional_label || result.constitutional_category}`;
    html += `  </div>`;
    if (result.constitutional_description) {
      html += `  <div class="non-admission-description">${result.constitutional_description}</div>`;
    }
    html += `</div>`;
    return html;
  }

  // ─── Scribe Mark ───────────────────────────────────────────────────
  function renderScribeMark(result) {
    let html = '';
    html += `<div class="scribe-mark-card">`;
    html += `  <div class="scribe-mark-header">`;
    html += `    <span class="scribe-mark-icon">&#x270D;</span>`;
    html += `    <span class="scribe-mark-title">Scribe Mark</span>`;
    html += `  </div>`;
    html += `  <div class="scribe-mark-body">`;
    html += `    <p class="scribe-mark-primary">This language is crossing toward authority inside admissible space.</p>`;
    html += `    <p class="scribe-mark-secondary">Make the crossing visible and return choice to the human.</p>`;
    html += `  </div>`;
    html += `  <div class="scribe-mark-crossing">`;
    html += `    <span class="crossing-label">Crossing Type:</span> <code>${result.scribe_crossing_type}</code>`;
    html += `    <span class="crossing-desc"> — ${result.scribe_crossing_label}</span>`;
    html += `  </div>`;
    html += `  <div class="scribe-mark-risk">`;
    html += `    <span class="risk-label">Risk Level:</span> <span class="risk-value risk-${result.risk_level}">${result.risk_level}</span>`;
    html += `  </div>`;
    html += `</div>`;
    return html;
  }

  // ─── No Mark ───────────────────────────────────────────────────────
  function renderNoMark(result) {
    let html = '';
    html += `<div class="no-mark-card">`;
    html += `  <div class="no-mark-header">`;
    html += `    <span class="no-mark-icon">&#x2713;</span>`;
    html += `    <span class="no-mark-title">No Mark</span>`;
    html += `  </div>`;
    html += `  <div class="no-mark-body">`;
    html += `    <p>No governance concern detected. The language passes all checks.</p>`;
    html += `  </div>`;
    html += `</div>`;
    return html;
  }

  // ─── Reliance Question ─────────────────────────────────────────────
  function showRelianceQuestion(result) {
    const reliance = engine.getRelianceQuestion(result.scribe_crossing_type, result.recommended_route);
    reliancePromptText.textContent = reliance.prompt;

    relianceOptions.innerHTML = '';
    for (const opt of reliance.options) {
      const btn = document.createElement('button');
      btn.className = 'reliance-btn';
      btn.textContent = opt.label;
      btn.dataset.id = opt.id;
      btn.addEventListener('click', () => {
        relianceOptions.querySelectorAll('.reliance-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        showRoute(result, opt.id);
      });
      relianceOptions.appendChild(btn);
    }

    relianceSection.classList.remove('hidden');
  }

  // ─── Route Recommendation ──────────────────────────────────────────
  function showRoute(result, relianceAnswer) {
    const routeId = result.recommended_route;
    const routeInfo = engine.ROUTE_DESCRIPTIONS[routeId];

    let html = '';
    html += `<div class="route-card route-${routeId}">`;
    html += `  <h3>Recommended Route: <code>${routeId}</code></h3>`;
    html += `  <p class="route-label">${routeInfo.label}</p>`;
    html += `  <p class="route-description">${routeInfo.description}</p>`;

    // Stub indicator for Answer Check and RIO
    if (routeInfo.stub) {
      html += `  <div class="route-stub-badge">STUB — Integration point only</div>`;
    }

    // Boundary copy
    html += `  <blockquote class="boundary-copy">${result.boundary_copy}</blockquote>`;
    html += `</div>`;

    routeBox.innerHTML = html;
    routeSection.classList.remove('hidden');
  }

})();
