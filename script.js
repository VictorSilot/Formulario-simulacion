/* ============================================================
   VICTOR SILOT BROKERS — Pre-Análisis de Financiamiento
   script.js — Lógica completa con ingresos complementarios
   ============================================================ */

/* ===== 1. ESTADO GLOBAL ===== */
let currentStep = 1;
const TOTAL_STEPS = 6;
const WHATSAPP_NUMBER = '5567996431786';
const COMPROMISO_PCT  = 0.30;  // 30% de la renta familiar

/* ===== 2. INICIALIZACIÓN ===== */
document.addEventListener('DOMContentLoaded', function () {
  initToggleGroups();
  initCurrencyMasks();
  initCPFMasks();
  initNavigationButtons();
  updateProgress(1);
});

/* ===== 3. BARRA DE PROGRESO ===== */
function updateProgress(step) {
  const pct  = Math.round((step / TOTAL_STEPS) * 100);
  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  const pctEl = document.getElementById('progressPct');
  const wrap  = document.querySelector('.progress-wrap');
  if (fill)  fill.style.width = pct + '%';
  if (text)  text.textContent = 'Paso ' + step + ' de ' + TOTAL_STEPS;
  if (pctEl) pctEl.textContent = pct + '%';
  if (wrap)  wrap.setAttribute('aria-valuenow', pct);
}

/* ===== 4. NAVEGACIÓN ===== */
function initNavigationButtons() {
  for (let i = 1; i < TOTAL_STEPS; i++) {
    (function(n) {
      const btn = document.getElementById('next' + n);
      if (btn) btn.addEventListener('click', function() { goNext(n); });
    })(i);
  }
  for (let i = 2; i <= TOTAL_STEPS; i++) {
    (function(n) {
      const btn = document.getElementById('prev' + n);
      if (btn) btn.addEventListener('click', function() { goPrev(n); });
    })(i);
  }
  const btnWA = document.getElementById('btnWhatsapp');
  if (btnWA) btnWA.addEventListener('click', enviarWhatsapp);
}

function goNext(from) {
  if (!validateStep(from)) return;
  showStep(from + 1);
}

function goPrev(from) {
  showStep(from - 1);
}

function showStep(n) {
  document.querySelectorAll('.step').forEach(function(s) {
    s.classList.remove('active');
  });
  const stepEl = document.getElementById('step' + n);
  if (stepEl) stepEl.classList.add('active');
  currentStep = n;
  updateProgress(n);
  if (n === 4) applyConyugeVisibility();
  if (n === 6) buildSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===== 5. CÓNYUGE ===== */
function applyConyugeVisibility() {
  const ec = document.getElementById('estadoCivil').value;
  const showConyuge = ec === 'Casado(a)' || ec === 'Unión Estable';
  const req  = document.getElementById('conyugeRequired');
  const skip = document.getElementById('conyugeSkip');
  if (req)  req.style.display = showConyuge ? 'block' : 'none';
  if (skip) skip.hidden = showConyuge;
}

/* ===== 6. TOGGLE GROUPS ===== */
function initToggleGroups() {
  document.querySelectorAll('.toggle-group').forEach(function(group) {
    group.querySelectorAll('.toggle-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        group.querySelectorAll('.toggle-btn').forEach(function(b) {
          b.classList.remove('selected');
        });
        btn.classList.add('selected');

        // Derivar ID del hidden input: quitar "Group" del final
        const hiddenId = group.id.replace('Group', '').replace('Comprov', 'Compr');
        const hiddenEl = document.getElementById(hiddenId);
        if (hiddenEl) hiddenEl.value = btn.dataset.value;

        handleConditionals(hiddenId, btn.dataset.value);
      });
    });
  });
}

function handleConditionals(fieldId, value) {
  const show = function(id) { const el = document.getElementById(id); if (el) el.classList.add('visible'); };
  const hide = function(id) { const el = document.getElementById(id); if (el) el.classList.remove('visible'); };

  switch (fieldId) {
    case 'ingCompTit':
      value === 'Sí' ? show('ingCompTitSection') : hide('ingCompTitSection'); break;
    case 'ingCompConj':
      value === 'Sí' ? show('ingCompConjSection') : hide('ingCompConjSection'); break;
    case 'restriccion':
      value === 'Sí' ? show('restriccionSection') : hide('restriccionSection'); break;
    case 'prestamos':
      value === 'Sí' ? show('prestamosSection') : hide('prestamosSection'); break;
    case 'financiamientos':
      value === 'Sí' ? show('financiamientosSection') : hide('financiamientosSection'); break;
    case 'deudasConj':
      value === 'Sí' ? show('deudasConjSection') : hide('deudasConjSection'); break;
  }
}

/* ===== 7. MÁSCARAS ===== */
function initCurrencyMasks() {
  const ids = [
    'salario', 'salarioConyuge', 'valorInmueble',
    'ingCompTitMonto', 'ingCompConjMonto',
    'cuotaPrestamo', 'cuotaFinanc', 'cuotasConj'
  ];
  ids.forEach(function(id) {
    const el = document.getElementById(id);
    if (el) applyCurrencyMask(el);
  });
}

function applyCurrencyMask(input) {
  input.addEventListener('input', function() {
    const raw = input.value.replace(/\D/g, '');
    if (!raw) { input.value = ''; return; }
    const num = (parseInt(raw, 10) / 100).toFixed(2);
    input.value = 'R$ ' + num.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  });
}

function initCPFMasks() {
  ['cpf', 'cpfConyuge'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) applyCPFMask(el);
  });
}

function applyCPFMask(input) {
  input.addEventListener('input', function() {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if      (v.length <= 3) input.value = v;
    else if (v.length <= 6) input.value = v.slice(0,3) + '.' + v.slice(3);
    else if (v.length <= 9) input.value = v.slice(0,3) + '.' + v.slice(3,6) + '.' + v.slice(6);
    else input.value = v.slice(0,3) + '.' + v.slice(3,6) + '.' + v.slice(6,9) + '-' + v.slice(9);
  });
}

/* ===== 8. VALIDACIÓN ===== */
function validateStep(step) {
  let ok = true;

  if (step === 1) {
    const nombre = document.getElementById('nombre');
    if (!nombre || !nombre.value.trim()) { setError('nombre', 'Ingrese su nombre completo'); ok = false; }
    else clearError('nombre');

    const cpf = document.getElementById('cpf');
    if (!cpf || !validateCPF(cpf.value)) { setError('cpf', 'CPF inválido'); ok = false; }
    else clearError('cpf');

    const tel = document.getElementById('telefono');
    if (!tel || tel.value.replace(/\D/g,'').length < 10) { setError('telefono', 'Ingrese un teléfono válido'); ok = false; }
    else clearError('telefono');

    const dia  = parseInt(document.getElementById('diaNac').value, 10);
    const anio = parseInt(document.getElementById('anioNac').value, 10);
    if (!dia || dia < 1 || dia > 31 || !anio || anio < 1930 || anio > 2007) {
      alert('Por favor complete su fecha de nacimiento correctamente.');
      ok = false;
    }

    if (!document.getElementById('estadoCivil').value) {
      alert('Por favor seleccione su estado civil.');
      ok = false;
    }
  }

  if (step === 2) {
    const sal = document.getElementById('salario');
    if (!sal || !sal.value) { setError('salario', 'Ingrese sus ingresos'); ok = false; }
    else clearError('salario');
  }

  if (step === 5) {
    const ciudad = document.getElementById('ciudad');
    if (!ciudad || !ciudad.value.trim()) { setError('ciudad', 'Ingrese la ciudad'); ok = false; }
    else clearError('ciudad');
  }

  return ok;
}

function validateCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0, r;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  r = 11 - (sum % 11); if (r >= 10) r = 0;
  if (r !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  r = 11 - (sum % 11); if (r >= 10) r = 0;
  return r === parseInt(cpf[10]);
}

function setError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  const fg = el.closest('.form-group');
  if (!fg) return;
  fg.classList.add('has-error');
  const errEl = fg.querySelector('.field-error');
  if (errEl && msg) errEl.textContent = msg;
}

function clearError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const fg = el.closest('.form-group');
  if (fg) fg.classList.remove('has-error');
}

/* ===== 9. CÁLCULO DE INGRESOS VÁLIDOS ===== */

/**
 * Determina si un ingreso complementario es válido para el cálculo.
 * Válido = declarado en IR  O  comprobable por extractos bancarios.
 * @param {string} irId  - ID del hidden input de IR
 * @param {string} extId - ID del hidden input de extractos
 * @returns {boolean}
 */
function ingCompEsValido(irId, extId) {
  return val(irId) === 'Sí' || val(extId) === 'Sí';
}

/**
 * Calcula los ingresos totales del titular, incluyendo complementarios validados.
 * @returns {{ salario, ingComp, ingCompValido, rentaTit }}
 */
function calcIngresosTitular() {
  const salario = parseCurrency(val('salario'));
  const tieneComp = val('ingCompTit') === 'Sí';
  const ingComp   = tieneComp ? parseCurrency(val('ingCompTitMonto')) : 0;
  const esValido  = tieneComp ? ingCompEsValido('ingCompTitIR', 'ingCompTitExt') : false;
  const ingCompValido = esValido ? ingComp : 0;
  return { salario, ingComp, ingCompValido, esValido: tieneComp && esValido, tieneComp,
           ir: val('ingCompTitIR'), ext: val('ingCompTitExt'),
           rentaTit: salario + ingCompValido };
}

/**
 * Calcula los ingresos totales del cónyuge, incluyendo complementarios validados.
 * @returns {{ salario, ingComp, ingCompValido, rentaConj }}
 */
function calcIngresosConj() {
  const ec = val('estadoCivil');
  const showConyuge = ec === 'Casado(a)' || ec === 'Unión Estable';
  if (!showConyuge) return { salario: 0, ingComp: 0, ingCompValido: 0, esValido: false, tieneComp: false, rentaConj: 0 };

  const salario = parseCurrency(val('salarioConyuge'));
  const tieneComp = val('ingCompConj') === 'Sí';
  const ingComp   = tieneComp ? parseCurrency(val('ingCompConjMonto')) : 0;
  const esValido  = tieneComp ? ingCompEsValido('ingCompConjIR', 'ingCompConjExt') : false;
  const ingCompValido = esValido ? ingComp : 0;
  return { salario, ingComp, ingCompValido, esValido: tieneComp && esValido, tieneComp,
           ir: val('ingCompConjIR'), ext: val('ingCompConjExt'),
           rentaConj: salario + ingCompValido };
}

/* ===== 10. RESUMEN / RESULTADOS ===== */

function buildSummary() {
  const ec = val('estadoCivil');
  const showConyuge = ec === 'Casado(a)' || ec === 'Unión Estable';

  const tit  = calcIngresosTitular();
  const conj = calcIngresosConj();

  const rentaFamiliar = tit.rentaTit + conj.rentaConj;

  // Cuotas comprometidas
  const cuotaP     = parseCurrency(val('cuotaPrestamo'));
  const cuotaF     = parseCurrency(val('cuotaFinanc'));
  const cuotasConj = showConyuge ? parseCurrency(val('cuotasConj')) : 0;
  const totalCuotas = cuotaP + cuotaF + cuotasConj;

  // Capacidad de financiamiento (30% de la renta familiar MENOS cuotas existentes)
  const capacidadBruta = rentaFamiliar * COMPROMISO_PCT;
  const cuotaMaxDisp   = capacidadBruta - totalCuotas;

  // ── Cabecera ──
  setText('sumNombre', val('nombre') || '—');
  const prof = val('profesion');
  setText('sumPerfil', (ec || '—') + (prof ? ' · ' + prof : ''));

  // ── Desglose de ingresos (bloque visual) ──
  const breakdown = document.getElementById('incomeBreakdown');
  if (breakdown) breakdown.innerHTML = buildIncomeBreakdownHTML(tit, conj, showConyuge, rentaFamiliar);

  // ── Cards de capacidad ──
  setText('sumRentaTotal',     rentaFamiliar > 0 ? fmt(rentaFamiliar) : '—');
  setText('sumComprometimiento', totalCuotas > 0  ? fmt(totalCuotas)  : 'Sin compromisos');
  setText('sumCuotaMax',       cuotaMaxDisp > 0  ? fmt(cuotaMaxDisp) : (rentaFamiliar === 0 ? '—' : 'Capacidad comprometida'));

  // ── Inmueble ──
  setText('sumInmueble', (val('tipoInmueble') || '—') + ' · ' + (val('condicion') || '—'));
  setText('sumCiudad', val('ciudad') || '—');

  // ── Elegibilidad ──
  const restriccion  = val('restriccion') === 'Sí';
  const deudas       = val('deudas') === 'Sí';
  const historial    = val('historial');
  const restriccConj = showConyuge && val('restriccionConj') === 'Sí';

  let level = 'green';
  if (restriccion || restriccConj || historial === 'Sí, pendientes') level = 'red';
  else if (deudas || historial !== 'No' || cuotaMaxDisp < 500) level = 'yellow';

  const labels = {
    green:  '✅ Perfil favorable para análisis',
    yellow: '⚠️ Perfil con puntos de atención',
    red:    '🔴 Restricciones detectadas — requiere análisis especial'
  };
  const elegEl = document.getElementById('sumElegibilidad');
  if (elegEl) elegEl.innerHTML = '<span class="eligibility-badge ' + level + '">' + labels[level] + '</span>';

  // ── Alertas ──
  let alertsHtml = '';
  if (cuotaMaxDisp > 0) {
    alertsHtml += '<div class="alert-box ok">💡 Cuota máxima disponible estimada: <strong>' + fmt(cuotaMaxDisp) + '/mês</strong> (30% de R$&nbsp;' + fmt(rentaFamiliar) + ' - compromisos actuales)</div>';
  } else if (rentaFamiliar > 0) {
    alertsHtml += '<div class="alert-box warning">⚠️ Los compromisos actuales superan el 30% de la renta familiar</div>';
  }
  if (tit.tieneComp && !tit.esValido) {
    alertsHtml += '<div class="alert-box warning">⚠ Ingresos complementarios del titular no fueron considerados — sin comprobación (IR ni extractos)</div>';
  }
  if (showConyuge && conj.tieneComp && !conj.esValido) {
    alertsHtml += '<div class="alert-box warning">⚠ Ingresos complementarios del cónyuge no fueron considerados — sin comprobación (IR ni extractos)</div>';
  }
  if (restriccion) alertsHtml += '<div class="alert-box warning">⚠️ El titular posee restricción en el nombre</div>';
  if (restriccConj) alertsHtml += '<div class="alert-box warning">⚠️ El cónyuge posee restricción en el nombre</div>';
  if (deudas) alertsHtml += '<div class="alert-box warning">⚠️ Se declararon deudas atrasadas</div>';

  const alertsEl = document.getElementById('sumAlertas');
  if (alertsEl) alertsEl.innerHTML = alertsHtml;
}

/**
 * Genera el HTML del desglose de ingresos para la pantalla de resultados.
 */
function buildIncomeBreakdownHTML(tit, conj, showConyuge, rentaFamiliar) {
  let html = '';

  // ── Titular ──
  html += buildIncomeRow('💼 Salario del Titular', tit.salario, [], false);
  if (tit.tieneComp && tit.ingComp > 0) {
    const badges = buildCompBadges(tit.ir, tit.ext, tit.esValido);
    const nota   = tit.esValido ? '' : ' <em style="font-size:11px;color:#B45309">(no considerado)</em>';
    html += buildIncomeRow('↳ Ingresos Complementarios Titular' + nota, tit.ingComp, badges, true);
  }
  html += buildIncomeRow('= Renta Neta Titular', tit.rentaTit, [], false, 'font-weight:700');

  if (showConyuge) {
    html += '<div style="height:8px"></div>';
    html += buildIncomeRow('💼 Salario del Cónyuge', conj.salario, [], false);
    if (conj.tieneComp && conj.ingComp > 0) {
      const badges = buildCompBadges(conj.ir, conj.ext, conj.esValido);
      const nota   = conj.esValido ? '' : ' <em style="font-size:11px;color:#B45309">(no considerado)</em>';
      html += buildIncomeRow('↳ Ingresos Complementarios Cónyuge' + nota, conj.ingComp, badges, true);
    }
    html += buildIncomeRow('= Renta Neta Cónyuge', conj.rentaConj, [], false, 'font-weight:700');
  }

  // ── Total ──
  html += '<div style="height:4px"></div>';
  html += '<div class="income-row total-row">'
        + '<div class="inc-left"><span class="inc-label">🏦 RENTA FAMILIAR TOTAL</span></div>'
        + '<span class="inc-value">' + (rentaFamiliar > 0 ? fmt(rentaFamiliar) : '—') + '</span>'
        + '</div>';

  return html;
}

function buildIncomeRow(label, amount, badges, isComp, extraStyle) {
  const rowClass = isComp ? 'income-row complementary' : 'income-row';
  const style    = extraStyle ? ' style="' + extraStyle + '"' : '';
  const badgeHTML = badges.length ? '<div class="inc-badges">' + badges.join('') + '</div>' : '';
  return '<div class="' + rowClass + '">'
       + '<div class="inc-left">'
       + '<span class="inc-label"' + style + '>' + label + '</span>'
       + badgeHTML
       + '</div>'
       + '<span class="inc-value"' + style + '>' + (amount > 0 ? fmt(amount) : 'R$ 0,00') + '</span>'
       + '</div>';
}

function buildCompBadges(ir, ext, esValido) {
  const badges = [];
  if (ir  === 'Sí') badges.push('<span class="badge-ir">✓ Impuesto Renta</span>');
  if (ext === 'Sí') badges.push('<span class="badge-ext">✓ Extractos Bancarios</span>');
  if (!esValido)    badges.push('<span class="badge-warn">⚠ Sin Comprobación</span>');
  return badges;
}

/* ===== 11. ENVÍO POR WHATSAPP ===== */
function enviarWhatsapp() {
  const ec          = val('estadoCivil');
  const showConyuge = ec === 'Casado(a)' || ec === 'Unión Estable';

  const tit  = calcIngresosTitular();
  const conj = calcIngresosConj();
  const rentaFamiliar = tit.rentaTit + conj.rentaConj;

  const cuotaP     = parseCurrency(val('cuotaPrestamo'));
  const cuotaF     = parseCurrency(val('cuotaFinanc'));
  const cuotasConj = showConyuge ? parseCurrency(val('cuotasConj')) : 0;
  const totalCuotas = cuotaP + cuotaF + cuotasConj;
  const cuotaMax   = (rentaFamiliar * COMPROMISO_PCT) - totalCuotas;

  const diaNac  = document.getElementById('diaNac').value;
  const mesNac  = document.getElementById('mesNac').value;
  const anioNac = document.getElementById('anioNac').value;
  const fechaNac = (diaNac && mesNac && anioNac) ? diaNac + '/' + mesNac + '/' + anioNac : '—';

  let msg = '*PRE-ANÁLISIS DE FINANCIAMIENTO*\n';
  msg += '_Víctor Silot Brokers_\n';
  msg += '━━━━━━━━━━━━━━━━━━━━━━\n\n';

  msg += '*👤 DATOS PERSONALES*\n';
  msg += '• Nombre: '       + val('nombre') + '\n';
  msg += '• CPF: '          + val('cpf') + '\n';
  msg += '• Nacimiento: '   + fechaNac + '\n';
  msg += '• Teléfono: '     + val('telefono') + '\n';
  if (val('email')) msg += '• E-mail: ' + val('email') + '\n';
  msg += '• Estado Civil: ' + ec + '\n';
  msg += '• Profesión: '    + (val('profesion') || '—') + '\n\n';

  msg += '*💼 INGRESOS DEL TITULAR*\n';
  msg += '• Vínculo laboral: ' + (val('vinculo') || '—') + '\n';
  msg += '• Ingreso principal: ' + (val('salario') || '—') + '\n';
  msg += '• FGTS +3 años: '    + (val('fgts') || '—') + '\n';
  msg += '• Dependientes: '    + val('dependientes') + '\n';
  if (val('ingCompTit') === 'Sí') {
    msg += '• Ingresos complementarios: ' + (val('ingCompTitDesc') || '—') + ' — ' + (val('ingCompTitMonto') || '—') + '\n';
    msg += '  ↳ Declarado IR: ' + val('ingCompTitIR') + ' | Extractos: ' + val('ingCompTitExt') + '\n';
    msg += '  ↳ ' + (tit.esValido ? '✓ CONSIDERADO en el cálculo' : '⚠ NO considerado (sin comprobación)') + '\n';
  }
  msg += '• Renta total titular: ' + fmt(tit.rentaTit) + '\n\n';

  msg += '*📊 SITUACIÓN FINANCIERA*\n';
  msg += '• Restricción (SPC/Serasa): ' + val('restriccion');
  if (val('restriccion') === 'Sí') msg += ' — ' + (val('restriccionDesc') || '—');
  msg += '\n';
  msg += '• Deudas atrasadas: ' + val('deudas') + '\n';
  msg += '• Préstamos activos: ' + val('prestamos');
  if (val('prestamos') === 'Sí') msg += ' (' + (val('cuotaPrestamo') || '—') + '/mês)';
  msg += '\n';
  msg += '• Financiamientos activos: ' + val('financiamientos');
  if (val('financiamientos') === 'Sí') msg += ' (' + (val('cuotaFinanc') || '—') + '/mês)';
  msg += '\n';
  msg += '• Historial de crédito: ' + val('historial') + '\n\n';

  if (showConyuge) {
    msg += '*👫 CÓNYUGE / COMPAÑERO(A)*\n';
    msg += '• Nombre: '    + (val('nombreConyuge') || '—') + '\n';
    msg += '• CPF: '       + (val('cpfConyuge') || '—') + '\n';
    const dC = document.getElementById('diaNacConyuge').value;
    const mC = document.getElementById('mesNacConyuge').value;
    const aC = document.getElementById('anioNacConyuge').value;
    if (dC && mC && aC) msg += '• Nacimiento: ' + dC + '/' + mC + '/' + aC + '\n';
    msg += '• Profesión: '       + (val('profesionConyuge') || '—') + '\n';
    msg += '• Ingreso principal: ' + (val('salarioConyuge') || '—') + '\n';
    if (val('ingCompConj') === 'Sí') {
      msg += '• Ingresos complementarios: ' + (val('ingCompConjDesc') || '—') + ' — ' + (val('ingCompConjMonto') || '—') + '\n';
      msg += '  ↳ Declarado IR: ' + val('ingCompConjIR') + ' | Extractos: ' + val('ingCompConjExt') + '\n';
      msg += '  ↳ ' + (conj.esValido ? '✓ CONSIDERADO en el cálculo' : '⚠ NO considerado (sin comprobación)') + '\n';
    }
    msg += '• Renta total cónyuge: ' + fmt(conj.rentaConj) + '\n';
    msg += '• Restricción: ' + val('restriccionConj') + '\n';
    msg += '• Deudas/financiamientos: ' + val('deudasConj');
    if (val('deudasConj') === 'Sí') msg += ' (' + (val('cuotasConj') || '—') + '/mês)';
    msg += '\n\n';
  }

  msg += '*📈 SIMULACIÓN DE FINANCIAMIENTO*\n';
  msg += '• Renta familiar total: ' + fmt(rentaFamiliar) + '\n';
  msg += '• Comprometimiento actual: ' + (totalCuotas > 0 ? fmt(totalCuotas) : 'Sin compromisos') + '\n';
  msg += '• Capacidad (30% renta): ' + fmt(rentaFamiliar * COMPROMISO_PCT) + '\n';
  msg += '• Cuota máxima disponible: ' + (cuotaMax > 0 ? fmt(cuotaMax) : 'Capacidad comprometida') + '\n\n';

  msg += '*🏠 INMUEBLE*\n';
  msg += '• Tipo: '        + (val('tipoInmueble') || '—') + '\n';
  msg += '• Condición: '   + (val('condicion') || '—') + '\n';
  msg += '• Valor: '       + (val('valorInmueble') || '—') + '\n';
  msg += '• Ciudad: '      + (val('ciudad') || '—') + '\n';
  msg += '• Entrada: '     + (val('entrada') || '—') + '\n';
  msg += '• Definido: '    + (val('inmuebleDefinido') || '—') + '\n';
  if (val('comentarios')) msg += '• Obs: ' + val('comentarios') + '\n';

  msg += '\n━━━━━━━━━━━━━━━━━━━━━━\n';
  msg += '⚠ Simulación preliminar — sujeita a análisis crediticio oficial\n';
  msg += '_Formulario generado por VictorSilot.com_';

  window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
}

/* ===== 12. UTILIDADES ===== */

function parseCurrency(str) {
  if (!str) return 0;
  return parseFloat(str.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
}

function fmt(n) {
  return 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
