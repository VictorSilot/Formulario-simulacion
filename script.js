/* ============================================================
   VICTOR SILOT BROKERS — Pre-Análisis de Financiamiento
   script.js — Toda la lógica de la aplicación
   ============================================================ */

/* ===== 1. ESTADO GLOBAL ===== */

let currentStep = 1;
const TOTAL_STEPS = 6;
const WHATSAPP_NUMBER = '5567996431786';  // Número destino

/* ===== 2. INICIALIZACIÓN ===== */

document.addEventListener('DOMContentLoaded', function () {
  initToggleGroups();
  initCurrencyMasks();
  initCPFMasks();
  initNavigationButtons();
  updateProgress(1);
});

/* ===== 3. BARRA DE PROGRESO ===== */

/**
 * Actualiza la barra de progreso y los textos de paso/porcentaje.
 * @param {number} step - Paso actual (1–6)
 */
function updateProgress(step) {
  const pct = Math.round((step / TOTAL_STEPS) * 100);

  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  const pctEl = document.getElementById('progressPct');

  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = 'Paso ' + step + ' de ' + TOTAL_STEPS;
  if (pctEl) pctEl.textContent = pct + '%';

  // Accesibilidad: actualizar el atributo aria
  const wrap = document.querySelector('.progress-wrap');
  if (wrap) wrap.setAttribute('aria-valuenow', pct);
}

/* ===== 4. NAVEGACIÓN ENTRE PASOS ===== */

/**
 * Registra los botones de navegación de todos los pasos.
 */
function initNavigationButtons() {
  // Botones "Continuar"
  for (let i = 1; i <= TOTAL_STEPS - 1; i++) {
    const nextBtn = document.getElementById('next' + i);
    if (nextBtn) {
      (function (stepNum) {
        nextBtn.addEventListener('click', function () {
          goNext(stepNum);
        });
      })(i);
    }
  }

  // Botones "Atrás"
  for (let i = 2; i <= TOTAL_STEPS; i++) {
    const prevBtn = document.getElementById('prev' + i);
    if (prevBtn) {
      (function (stepNum) {
        prevBtn.addEventListener('click', function () {
          goPrev(stepNum);
        });
      })(i);
    }
  }

  // Botón WhatsApp
  const btnWA = document.getElementById('btnWhatsapp');
  if (btnWA) btnWA.addEventListener('click', enviarWhatsapp);
}

/**
 * Avanza al siguiente paso tras validar el actual.
 * @param {number} from - Número del paso actual
 */
function goNext(from) {
  if (!validateStep(from)) return;
  showStep(from + 1);
}

/**
 * Retrocede al paso anterior.
 * @param {number} from - Número del paso actual
 */
function goPrev(from) {
  showStep(from - 1);
}

/**
 * Muestra el paso indicado y oculta los demás.
 * @param {number} n - Número del paso a mostrar
 */
function showStep(n) {
  // Ocultar todos los pasos
  document.querySelectorAll('.step').forEach(function (s) {
    s.classList.remove('active');
  });

  // Activar el paso solicitado
  var stepEl = document.getElementById('step' + n);
  if (stepEl) stepEl.classList.add('active');

  currentStep = n;
  updateProgress(n);

  // Lógica especial por paso
  if (n === 4) applyConyugeVisibility();
  if (n === 6) buildSummary();

  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===== 5. VISIBILIDAD DEL PASO DE CÓNYUGE ===== */

/**
 * Muestra u oculta el formulario de cónyuge según el estado civil.
 */
function applyConyugeVisibility() {
  var ec = document.getElementById('estadoCivil').value;
  var showConyuge = ec === 'Casado(a)' || ec === 'Unión Estable';

  var reqBlock = document.getElementById('conyugeRequired');
  var skipBlock = document.getElementById('conyugeSkip');

  if (reqBlock) reqBlock.style.display = showConyuge ? 'block' : 'none';
  if (skipBlock) skipBlock.hidden = showConyuge;
}

/* ===== 6. TOGGLE GROUPS ===== */

/**
 * Inicializa todos los grupos de botones toggle.
 * Cada botón actualiza su hidden input y ejecuta la lógica condicional.
 */
function initToggleGroups() {
  document.querySelectorAll('.toggle-group').forEach(function (group) {
    group.querySelectorAll('.toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Deseleccionar todos los del grupo
        group.querySelectorAll('.toggle-btn').forEach(function (b) {
          b.classList.remove('selected');
        });
        // Seleccionar el pulsado
        btn.classList.add('selected');

        // Obtener el ID del input hidden asociado (convención: groupId sin "Group")
        var hiddenId = group.id.replace('Group', '').replace('Comprov', 'Compr');
        var hiddenEl = document.getElementById(hiddenId);
        if (hiddenEl) hiddenEl.value = btn.dataset.value;

        // Ejecutar lógica condicional
        handleConditionals(hiddenId, btn.dataset.value);
      });
    });
  });
}

/**
 * Muestra u oculta secciones condicionales según el campo y valor seleccionado.
 * @param {string} fieldId - ID del input hidden
 * @param {string} value   - Valor seleccionado
 */
function handleConditionals(fieldId, value) {
  var showSection = function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('visible');
  };
  var hideSection = function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('visible');
  };

  switch (fieldId) {
    case 'ingVar':
      value === 'Sí' ? showSection('ingVarSection') : hideSection('ingVarSection');
      break;
    case 'restriccion':
      value === 'Sí' ? showSection('restriccionSection') : hideSection('restriccionSection');
      break;
    case 'prestamos':
      value === 'Sí' ? showSection('prestamosSection') : hideSection('prestamosSection');
      break;
    case 'financiamientos':
      value === 'Sí' ? showSection('financiamientosSection') : hideSection('financiamientosSection');
      break;
    case 'deudasConj':
      value === 'Sí' ? showSection('deudasConjSection') : hideSection('deudasConjSection');
      break;
  }
}

/* ===== 7. MÁSCARAS DE CAMPOS ===== */

/**
 * Aplica máscaras de moneda (R$) a los campos especificados.
 */
function initCurrencyMasks() {
  var currencyFields = [
    'salario', 'salarioConyuge', 'valorInmueble',
    'ingVarMonto', 'cuotaPrestamo', 'cuotaFinanc', 'cuotasConj'
  ];

  currencyFields.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) applyCurrentcyMask(el);
  });
}

/**
 * Aplica máscara de moneda brasileña (R$ X.XXX,XX) a un input.
 * @param {HTMLInputElement} input
 */
function applyCurrentcyMask(input) {
  input.addEventListener('input', function () {
    var raw = input.value.replace(/\D/g, '');
    if (!raw) { input.value = ''; return; }
    var num = (parseInt(raw, 10) / 100).toFixed(2);
    input.value = 'R$ ' + num.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  });
}

/**
 * Aplica máscaras de CPF a los campos indicados.
 */
function initCPFMasks() {
  var cpfFields = ['cpf', 'cpfConyuge'];
  cpfFields.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) applyCPFMask(el);
  });
}

/**
 * Aplica máscara de CPF (XXX.XXX.XXX-XX) a un input.
 * @param {HTMLInputElement} input
 */
function applyCPFMask(input) {
  input.addEventListener('input', function () {
    var v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);

    if (v.length <= 3) input.value = v;
    else if (v.length <= 6) input.value = v.slice(0, 3) + '.' + v.slice(3);
    else if (v.length <= 9) input.value = v.slice(0, 3) + '.' + v.slice(3, 6) + '.' + v.slice(6);
    else input.value = v.slice(0, 3) + '.' + v.slice(3, 6) + '.' + v.slice(6, 9) + '-' + v.slice(9);
  });
}

/* ===== 8. VALIDACIÓN ===== */

/**
 * Valida los campos requeridos de un paso.
 * @param {number} step - Paso a validar
 * @returns {boolean} true si todo es válido
 */
function validateStep(step) {
  var ok = true;

  if (step === 1) {
    // Nombre
    var nombre = document.getElementById('nombre');
    if (!nombre || !nombre.value.trim()) {
      setError('nombre', 'Ingrese su nombre completo');
      ok = false;
    } else {
      clearError('nombre');
    }

    // CPF
    var cpf = document.getElementById('cpf');
    if (!cpf || !validateCPF(cpf.value)) {
      setError('cpf', 'CPF inválido');
      ok = false;
    } else {
      clearError('cpf');
    }

    // Teléfono
    var tel = document.getElementById('telefono');
    if (!tel || tel.value.replace(/\D/g, '').length < 10) {
      setError('telefono', 'Ingrese un teléfono válido');
      ok = false;
    } else {
      clearError('telefono');
    }

    // Fecha de nacimiento
    var dia = parseInt(document.getElementById('diaNac').value, 10);
    var anio = parseInt(document.getElementById('anioNac').value, 10);
    if (!dia || dia < 1 || dia > 31 || !anio || anio < 1930 || anio > 2007) {
      ok = false;
      if (!ok) alert('Por favor complete su fecha de nacimiento correctamente.');
    }

    // Estado civil
    if (!document.getElementById('estadoCivil').value) {
      ok = false;
      alert('Por favor seleccione su estado civil.');
    }
  }

  if (step === 2) {
    // Salario
    var sal = document.getElementById('salario');
    if (!sal || !sal.value) {
      setError('salario', 'Ingrese sus ingresos');
      ok = false;
    } else {
      clearError('salario');
    }
  }

  if (step === 5) {
    // Ciudad
    var ciudad = document.getElementById('ciudad');
    if (!ciudad || !ciudad.value.trim()) {
      setError('ciudad', 'Ingrese la ciudad');
      ok = false;
    } else {
      clearError('ciudad');
    }
  }

  return ok;
}

/**
 * Valida un CPF brasileño.
 * @param {string} cpf - CPF formateado o crudo
 * @returns {boolean}
 */
function validateCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  var sum, r, i;

  sum = 0;
  for (i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  r = 11 - (sum % 11);
  if (r >= 10) r = 0;
  if (r !== parseInt(cpf[9])) return false;

  sum = 0;
  for (i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  r = 11 - (sum % 11);
  if (r >= 10) r = 0;
  return r === parseInt(cpf[10]);
}

/**
 * Marca un campo como error con mensaje.
 * @param {string} id  - ID del input
 * @param {string} msg - Mensaje de error
 */
function setError(id, msg) {
  var el = document.getElementById(id);
  if (!el) return;
  var fg = el.closest('.form-group');
  if (!fg) return;
  fg.classList.add('has-error');
  var errEl = fg.querySelector('.field-error');
  if (errEl && msg) errEl.textContent = msg;
}

/**
 * Limpia el estado de error de un campo.
 * @param {string} id - ID del input
 */
function clearError(id) {
  var el = document.getElementById(id);
  if (!el) return;
  var fg = el.closest('.form-group');
  if (fg) fg.classList.remove('has-error');
}

/* ===== 9. GENERACIÓN DEL RESUMEN ===== */

/**
 * Construye el resumen completo del paso 6.
 */
function buildSummary() {
  var ec = document.getElementById('estadoCivil').value;
  var showConyuge = ec === 'Casado(a)' || ec === 'Unión Estable';

  var nombre = document.getElementById('nombre').value;
  var prof = document.getElementById('profesion').value;
  var salario = parseCurrency(document.getElementById('salario').value);
  var salConyuge = showConyuge ? parseCurrency(document.getElementById('salarioConyuge').value) : 0;
  var rentaTotal = salario + salConyuge;

  // Cuotas comprometidas
  var cuotaP = parseCurrency(document.getElementById('cuotaPrestamo').value);
  var cuotaF = parseCurrency(document.getElementById('cuotaFinanc').value);
  var cuotasConj = showConyuge ? parseCurrency(document.getElementById('cuotasConj').value) : 0;
  var totalCuotas = cuotaP + cuotaF + cuotasConj;

  // Capacidad estimada (30% de la renta)
  var maxParcela = rentaTotal * 0.30;
  var disponivel = maxParcela - totalCuotas;

  // Poblar elementos del resumen
  setText('sumNombre', nombre || '—');
  setText('sumPerfil', (ec || '—') + (prof ? ' · ' + prof : ''));
  setText('sumSalario', salario > 0 ? fmt(salario) : '—');
  setText('sumSalarioConyuge', showConyuge && salConyuge > 0 ? fmt(salConyuge) : 'N/A');
  setText('sumRentaTotal', rentaTotal > 0 ? fmt(rentaTotal) : '—');
  setText('sumComprometimiento', totalCuotas > 0 ? fmt(totalCuotas) + '/mês' : 'Sin compromisos');
  setText('sumInmueble', (val('tipoInmueble') || '—') + ' · ' + (val('condicion') || '—'));
  setText('sumCiudad', val('ciudad') || '—');

  // Determinar nivel de elegibilidad
  var restriccion = val('restriccion') === 'Sí';
  var deudas = val('deudas') === 'Sí';
  var historial = val('historial');
  var restriccConj = showConyuge && val('restriccionConj') === 'Sí';

  var level = 'green';
  if (restriccion || restriccConj || historial === 'Sí, pendientes') {
    level = 'red';
  } else if (deudas || historial !== 'No' || disponivel < 500) {
    level = 'yellow';
  }

  var labels = {
    green: '✅ Perfil favorable para análisis',
    yellow: '⚠️ Perfil con puntos de atención',
    red: '🔴 Restricciones detectadas — requiere análisis especial'
  };

  var elegEl = document.getElementById('sumElegibilidad');
  if (elegEl) {
    elegEl.innerHTML = '<span class="eligibility-badge ' + level + '">' + labels[level] + '</span>';
  }

  // Alertas
  var alertsHtml = '';
  if (disponivel > 0) {
    alertsHtml += '<div class="alert-box ok">💡 Capacidad estimada de parcela disponible: <strong>'
      + fmt(disponivel) + '/mês</strong></div>';
  }
  if (restriccion) {
    alertsHtml += '<div class="alert-box warning">⚠️ El titular posee restricción en el nombre</div>';
  }
  if (restriccConj) {
    alertsHtml += '<div class="alert-box warning">⚠️ El cónyuge posee restricción en el nombre</div>';
  }
  if (deudas) {
    alertsHtml += '<div class="alert-box warning">⚠️ Se declararon deudas atrasadas</div>';
  }

  var alertsEl = document.getElementById('sumAlertas');
  if (alertsEl) alertsEl.innerHTML = alertsHtml;
}

/* ===== 10. ENVÍO POR WHATSAPP ===== */

/**
 * Construye el mensaje y abre WhatsApp con toda la información del formulario.
 */
function enviarWhatsapp() {
  var ec = val('estadoCivil');
  var showConyuge = ec === 'Casado(a)' || ec === 'Unión Estable';

  var diaNac = document.getElementById('diaNac').value;
  var mesNac = document.getElementById('mesNac').value;
  var anioNac = document.getElementById('anioNac').value;
  var fechaNac = (diaNac && mesNac && anioNac) ? diaNac + '/' + mesNac + '/' + anioNac : '—';

  var msg = '*PRE-ANÁLISIS DE FINANCIAMIENTO*\n';
  msg += '_Corretor Víctor Silot_\n';
  msg += '━━━━━━━━━━━━━━━━━━━━━━\n\n';

  // Datos personales
  msg += '*👤 DATOS PERSONALES*\n';
  msg += '• Nombre: ' + val('nombre') + '\n';
  msg += '• CPF: ' + val('cpf') + '\n';
  msg += '• Nacimiento: ' + fechaNac + '\n';
  msg += '• Teléfono: ' + val('telefono') + '\n';
  var email = val('email');
  if (email) msg += '• E-mail: ' + email + '\n';
  msg += '• Estado Civil: ' + ec + '\n';
  msg += '• Profesión: ' + (val('profesion') || '—') + '\n\n';

  // Ingresos y trabajo
  msg += '*💼 INGRESOS Y TRABAJO*\n';
  msg += '• Tipo de vínculo: ' + (val('vinculo') || '—') + '\n';
  msg += '• Ingreso bruto: ' + (val('salario') || '—') + '\n';
  msg += '• FGTS +3 años: ' + (val('fgts') || '—') + '\n';
  msg += '• Dependientes: ' + val('dependientes') + '\n';
  if (val('ingVar') === 'Sí') {
    msg += '• Ingresos variables: ' + (val('ingVarOrigen') || '—') + ' — ' + (val('ingVarMonto') || '—') + '\n';
  }
  msg += '\n';

  // Situación financiera
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

  // Cónyuge (solo si aplica)
  if (showConyuge) {
    msg += '*👫 CÓNYUGE / COMPAÑERO(A)*\n';
    msg += '• Nombre: ' + (val('nombreConyuge') || '—') + '\n';
    msg += '• CPF: ' + (val('cpfConyuge') || '—') + '\n';

    var dC = document.getElementById('diaNacConyuge').value;
    var mC = document.getElementById('mesNacConyuge').value;
    var aC = document.getElementById('anioNacConyuge').value;
    if (dC && mC && aC) msg += '• Nacimiento: ' + dC + '/' + mC + '/' + aC + '\n';

    msg += '• Profesión: ' + (val('profesionConyuge') || '—') + '\n';
    msg += '• Ingreso bruto: ' + (val('salarioConyuge') || '—') + '\n';
    msg += '• Ingresos comprobables: ' + (val('ingComprConyuge') || '—') + '\n';
    msg += '• Restricción: ' + val('restriccionConj') + '\n';
    msg += '• Deudas/financiamientos: ' + val('deudasConj');
    if (val('deudasConj') === 'Sí') msg += ' (' + (val('cuotasConj') || '—') + '/mês)';
    msg += '\n\n';
  }

  // Inmueble
  msg += '*🏠 INMUEBLE*\n';
  msg += '• Tipo: ' + (val('tipoInmueble') || '—') + '\n';
  msg += '• Condición: ' + (val('condicion') || '—') + '\n';
  msg += '• Valor: ' + (val('valorInmueble') || '—') + '\n';
  msg += '• Ciudad: ' + (val('ciudad') || '—') + '\n';
  msg += '• Entrada disponible: ' + (val('entrada') || '—') + '\n';
  msg += '• Inmueble definido: ' + (val('inmuebleDefinido') || '—') + '\n';

  var coment = val('comentarios');
  if (coment) msg += '• Obs: ' + coment + '\n';

  msg += '\n━━━━━━━━━━━━━━━━━━━━━━\n';
  msg += 'Formulario generado por Corretor Víctor Silot';

  window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
}

/* ===== 11. UTILIDADES ===== */

/**
 * Convierte un string de moneda brasileña a número.
 * @param {string} str - Ej: "R$ 1.500,00"
 * @returns {number}
 */
function parseCurrency(str) {
  if (!str) return 0;
  return parseFloat(
    str.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
  ) || 0;
}

/**
 * Formatea un número como moneda brasileña.
 * @param {number} n
 * @returns {string} Ej: "R$ 1.500,00"
 */
function fmt(n) {
  return 'R$ ' + n.toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Obtiene el value de un input por su ID.
 * @param {string} id
 * @returns {string}
 */
function val(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}

/**
 * Establece el textContent de un elemento por su ID.
 * @param {string} id
 * @param {string} text
 */
function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}
