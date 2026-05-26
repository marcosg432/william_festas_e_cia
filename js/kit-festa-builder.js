/**
 * Kit Festa 2026 — montador (kit-festa.html)
 * Regras e quantidades conforme cardápio Kit Festa 2026.
 */
(function () {
    'use strict';

    var WA = typeof CONFIG !== 'undefined' && CONFIG.telefoneWhatsApp ? String(CONFIG.telefoneWhatsApp) : '5516991280505';

    /** @type {Array<{p: number, bolo: string, doces: number, docesSabores: number, salgados: number, salgadosSabores: number, vista: number, parc: number}>} */
    var KITS = [
        { p: 5, bolo: '500 g', doces: 15, docesSabores: 3, salgados: 75, salgadosSabores: 3, vista: 103, parc: 107 },
        { p: 10, bolo: '1 kg', doces: 30, docesSabores: 3, salgados: 150, salgadosSabores: 5, vista: 205, parc: 214 },
        { p: 15, bolo: '1,5 kg', doces: 45, docesSabores: 3, salgados: 225, salgadosSabores: 6, vista: 307, parc: 321 },
        { p: 20, bolo: '2 kg', doces: 60, docesSabores: 3, salgados: 300, salgadosSabores: 6, vista: 410, parc: 428 },
        { p: 25, bolo: '2,5 kg', doces: 75, docesSabores: 3, salgados: 375, salgadosSabores: 7, vista: 512, parc: 535 },
        { p: 30, bolo: '3 kg', doces: 90, docesSabores: 3, salgados: 450, salgadosSabores: 9, vista: 615, parc: 642 },
        { p: 35, bolo: '3,5 kg', doces: 105, docesSabores: 3, salgados: 525, salgadosSabores: 10, vista: 717, parc: 749 },
        { p: 40, bolo: '4 kg', doces: 120, docesSabores: 3, salgados: 600, salgadosSabores: 10, vista: 820, parc: 856 },
        { p: 45, bolo: '4,5 kg', doces: 135, docesSabores: 3, salgados: 675, salgadosSabores: 12, vista: 922, parc: 963 },
        { p: 50, bolo: '5 kg', doces: 150, docesSabores: 3, salgados: 750, salgadosSabores: 14, vista: 1025, parc: 1070 }
    ];

    var MASSAS = ['Branca', 'Chocolate', 'Mesclada'];
    var RECHEIOS = [
        'Mousse de Ninho',
        'Mousse de chocolate',
        'Brigadeiro',
        'Brigadeiro de ninho',
        'Prestígio',
        'Doce de leite'
    ];
    var ADICIONAIS = [
        'Morango',
        'Abacaxi',
        'Ganache amargo',
        'Chocolate preto picado',
        'Chocolate branco picado',
        'Ganache avelã'
    ];
    var DOCES = [
        'Brigadeiro',
        'Beijinho de coco',
        'Cajuzinho',
        '2 amores',
        'Brigadeiro de ninho',
        'Brigadeiro com coco',
        'Beijinho coco queimado',
        'Bicho de pé'
    ];
    var SALGADOS_FRITOS = [
        'Coxinha de frango',
        'Kibe',
        'Travesseirinho de milho',
        'Empanado salsicha',
        'Risole de ricota e milho',
        'Risole de carne',
        'Pastel de carne',
        'Pastel de pizza',
        'Pastel frango',
        'Pastel queijo',
        'Bolinha de queijo',
        'Travesseirinho presunto e mussarela'
    ];
    var SALGADOS_ASSADOS = [
        'Enroladinho de salsicha',
        'Pãozinho de Ricota',
        'Esfirra de carne',
        'Esfirra calabresa',
        'Pizza presunto e queijo',
        'Pizza calabresa e queijo'
    ];

    var RECHEIO_MAX = 2;
    var ADICIONAL_MAX = 1;

    var state = {
        kitIndex: null,
        massa: null,
        recheios: [],
        adicionais: [],
        doces: [],
        salgados: []
    };

    var els = {};

    function fmtMoney(n) {
        return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    function currentKit() {
        return state.kitIndex != null ? KITS[state.kitIndex] : null;
    }

    function toggleUnique(arr, val, max) {
        var i = arr.indexOf(val);
        if (i >= 0) {
            arr.splice(i, 1);
            return true;
        }
        if (arr.length >= max) return false;
        arr.push(val);
        return true;
    }

    function toggleMassa(val) {
        state.massa = state.massa === val ? null : val;
    }

    function resetSelectionsForNewKit() {
        state.massa = null;
        state.recheios = [];
        state.adicionais = [];
        state.doces = [];
        state.salgados = [];
    }

    function updateContextBanner() {
        var el = document.getElementById('kf-ctx-kit');
        var kit = currentKit();
        if (!el) return;
        if (!kit) {
            el.textContent = '';
            return;
        }
        el.textContent =
            'Personalizando o kit para ' +
            kit.p +
            ' pessoas — siga as quantidades de sabores indicadas no cardápio.';
    }

    function selectKit(index) {
        state.kitIndex = index;
        resetSelectionsForNewKit();
        syncKitCards();
        revealBuilder();
        updateContextBanner();
        renderAllOptions();
        updateResumo();
        scrollToMonte();
    }

    function syncKitCards() {
        if (!els.kitCards) return;
        for (var i = 0; i < els.kitCards.length; i++) {
            var on = i === state.kitIndex;
            els.kitCards[i].classList.toggle('is-selected', on);
            els.kitCards[i].setAttribute('aria-pressed', on ? 'true' : 'false');
        }
    }

    function revealBuilder() {
        if (!els.monteSection) return;
        els.monteSection.classList.add('is-active');
        els.monteSection.removeAttribute('hidden');
    }

    function scrollToMonte() {
        if (!els.monteSection) return;
        requestAnimationFrame(function () {
            els.monteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    function renderKitGrid() {
        var root = document.getElementById('kf-kits-root');
        if (!root) return;
        var html = '';
        for (var i = 0; i < KITS.length; i++) {
            var k = KITS[i];
            html +=
                '<article class="kf-kit-card" role="button" tabindex="0" data-kit-index="' +
                i +
                '" aria-pressed="false">' +
                '<header class="kf-kit-card__head">' +
                '<span class="kf-kit-card__badge">' +
                k.p +
                ' pessoas</span>' +
                '<h3 class="kf-kit-card__title">Kit ' +
                k.p +
                ' pessoas</h3>' +
                '</header>' +
                '<div class="kf-kit-card__divider" aria-hidden="true"></div>' +
                '<ul class="kf-kit-card__list">' +
                '<li><span class="kf-kit-card__ico" aria-hidden="true">🎂</span><span class="kf-kit-card__item-label">Bolo</span><span class="kf-kit-card__item-val">' +
                k.bolo +
                '</span></li>' +
                '<li><span class="kf-kit-card__ico" aria-hidden="true">🍬</span><span class="kf-kit-card__item-label">Doces</span><span class="kf-kit-card__item-val">' +
                k.doces +
                ' <strong>(' +
                k.docesSabores +
                ' sabores)</strong></span></li>' +
                '<li><span class="kf-kit-card__ico" aria-hidden="true">🥟</span><span class="kf-kit-card__item-label">Salgados</span><span class="kf-kit-card__item-val">' +
                k.salgados +
                ' <strong>(' +
                k.salgadosSabores +
                ' sabores)</strong></span></li>' +
                '</ul>' +
                '<div class="kf-kit-card__precos">' +
                '<p class="kf-kit-card__vista">' +
                fmtMoney(k.vista) +
                ' <span>à vista</span></p>' +
                '<p class="kf-kit-card__parc">' +
                fmtMoney(k.parc) +
                ' <span>até 3x</span></p>' +
                '</div>' +
                '<span class="kf-kit-card__choose">Escolher este kit</span>' +
                '</article>';
        }
        root.innerHTML = html;
        els.kitCards = root.querySelectorAll('.kf-kit-card');
        for (var j = 0; j < els.kitCards.length; j++) {
            bindKitCard(els.kitCards[j], parseInt(els.kitCards[j].getAttribute('data-kit-index'), 10));
        }
    }

    function bindKitCard(card, index) {
        function go() {
            selectKit(index);
        }
        card.addEventListener('click', function (e) {
            if (e.target.closest('a')) return;
            go();
        });
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                go();
            }
        });
    }

    function chipHtml(group, value, label) {
        var safeAttr = String(value).replace(/\\/g, '\\\\').replace(/"/g, '&quot;');
        var safeLabel = String(label).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        return (
            '<button type="button" class="kf-opt" data-kf-g="' +
            group +
            '" data-kf-v="' +
            safeAttr +
            '">' +
            safeLabel +
            '</button>'
        );
    }

    function fillGroup(containerId, group, items) {
        var el = document.getElementById(containerId);
        if (!el) return;
        var h = '';
        for (var i = 0; i < items.length; i++) {
            h += chipHtml(group, items[i], items[i]);
        }
        el.innerHTML = h;
    }

    function renderAllOptions() {
        fillGroup('kf-opt-massas', 'massa', MASSAS);
        fillGroup('kf-opt-recheios', 'recheio', RECHEIOS);
        fillGroup('kf-opt-adicionais', 'adicional', ADICIONAIS);
        fillGroup('kf-opt-doces', 'doce', DOCES);
        fillGroup('kf-opt-salg-fritos', 'salgado', SALGADOS_FRITOS);
        fillGroup('kf-opt-salg-assados', 'salgado', SALGADOS_ASSADOS);
        bindOptionButtons();
        updateOptionStates();
        updateLimitHints();
    }

    function bindOptionButtons() {
        if (!els.monteSection) return;
        var btns = els.monteSection.querySelectorAll('.kf-opt');
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', onOptionClick);
        }
    }

    function onOptionClick() {
        var g = this.getAttribute('data-kf-g');
        var v = this.getAttribute('data-kf-v');
        if (!g || v == null) return;
        var kit = currentKit();
        if (!kit) return;

        if (g === 'massa') {
            toggleMassa(v);
        } else if (g === 'recheio') {
            toggleUnique(state.recheios, v, RECHEIO_MAX);
        } else if (g === 'adicional') {
            toggleUnique(state.adicionais, v, ADICIONAL_MAX);
        } else if (g === 'doce') {
            var maxD = kit.docesSabores;
            if (state.doces.indexOf(v) < 0 && state.doces.length >= maxD) return;
            toggleUnique(state.doces, v, maxD);
        } else if (g === 'salgado') {
            var maxS = kit.salgadosSabores;
            if (state.salgados.indexOf(v) < 0 && state.salgados.length >= maxS) return;
            toggleUnique(state.salgados, v, maxS);
        }

        updateOptionStates();
        updateLimitHints();
        updateResumo();
    }

    function updateOptionStates() {
        if (!els.monteSection) return;
        var kit = currentKit();
        var btns = els.monteSection.querySelectorAll('.kf-opt');
        for (var i = 0; i < btns.length; i++) {
            var b = btns[i];
            var g = b.getAttribute('data-kf-g');
            var v = b.getAttribute('data-kf-v');
            var sel = false;
            var dis = false;

            if (g === 'massa') sel = state.massa === v;
            else if (g === 'recheio') sel = state.recheios.indexOf(v) >= 0;
            else if (g === 'adicional') sel = state.adicionais.indexOf(v) >= 0;
            else if (g === 'doce') sel = state.doces.indexOf(v) >= 0;
            else if (g === 'salgado') sel = state.salgados.indexOf(v) >= 0;

            if (kit) {
                if (g === 'recheio' && !sel && state.recheios.length >= RECHEIO_MAX) dis = true;
                if (g === 'adicional' && !sel && state.adicionais.length >= ADICIONAL_MAX) dis = true;
                if (g === 'doce' && !sel && state.doces.length >= kit.docesSabores) dis = true;
                if (g === 'salgado' && !sel && state.salgados.length >= kit.salgadosSabores) dis = true;
            }

            b.classList.toggle('is-selected', sel);
            b.classList.toggle('is-disabled', dis);
            b.setAttribute('aria-pressed', sel ? 'true' : 'false');
            b.setAttribute('aria-disabled', dis ? 'true' : 'false');
        }
    }

    function updateRuleLabels() {
        var kit = currentKit();
        var rd = document.getElementById('kf-rule-doces');
        var rs = document.getElementById('kf-rule-salg');
        if (rd) rd.textContent = kit ? 'exatamente ' + kit.docesSabores + ' sabores' : 'sabores';
        if (rs) rs.textContent = kit ? 'exatamente ' + kit.salgadosSabores + ' sabores' : 'sabores';
    }

    function updateLimitHints() {
        updateRuleLabels();
        var kit = currentKit();
        var docHint = document.getElementById('kf-hint-doces');
        var salHint = document.getElementById('kf-hint-salgados');
        if (docHint && kit) {
            var dLeft = Math.max(0, kit.docesSabores - state.doces.length);
            docHint.textContent =
                state.doces.length >= kit.docesSabores
                    ? 'Você já selecionou o limite de sabores de doces deste kit.'
                    : 'Selecione ' +
                      kit.docesSabores +
                      ' sabores de doces (' +
                      dLeft +
                      ' restante' +
                      (dLeft !== 1 ? 's' : '') +
                      ').';
        } else if (docHint) {
            docHint.textContent = '';
        }
        if (salHint && kit) {
            var sLeft = Math.max(0, kit.salgadosSabores - state.salgados.length);
            salHint.textContent =
                state.salgados.length >= kit.salgadosSabores
                    ? 'Você já selecionou o limite de sabores de salgados deste kit.'
                    : 'Selecione ' +
                      kit.salgadosSabores +
                      ' sabores de salgados (' +
                      sLeft +
                      ' restante' +
                      (sLeft !== 1 ? 's' : '') +
                      '), entre fritos e assados.';
        } else if (salHint) {
            salHint.textContent = '';
        }
    }

    function isComplete() {
        var kit = currentKit();
        if (!kit) return false;
        if (!state.massa) return false;
        if (state.recheios.length < 1 || state.recheios.length > RECHEIO_MAX) return false;
        if (state.doces.length !== kit.docesSabores) return false;
        if (state.salgados.length !== kit.salgadosSabores) return false;
        return true;
    }

    function buildWhatsAppText() {
        var kit = currentKit();
        if (!kit) return '';
        var lines = [];
        lines.push('Olá! Gostaria de solicitar um orçamento.');
        lines.push('');
        lines.push('🎉 Kit escolhido: ' + kit.p + ' pessoas');
        lines.push('🎂 Bolo: ' + kit.bolo + ' (cobertura: Chantilly)');
        lines.push('🍬 Incluso: ' + kit.doces + ' doces em ' + kit.docesSabores + ' sabores');
        lines.push('🥟 Incluso: ' + kit.salgados + ' salgados em ' + kit.salgadosSabores + ' sabores');
        lines.push('');
        lines.push('🎂 Massa:');
        lines.push(state.massa || '—');
        lines.push('');
        lines.push('🍫 Recheios:');
        lines.push(state.recheios.length ? state.recheios.join(', ') : '—');
        lines.push('');
        lines.push('🍓 Adicionais:');
        lines.push(state.adicionais.length ? state.adicionais.join(', ') : 'Nenhum');
        lines.push('');
        lines.push('🍬 Doces (sabores):');
        lines.push(state.doces.length ? state.doces.join(', ') : '—');
        lines.push('');
        lines.push('🥟 Salgados (sabores):');
        lines.push(state.salgados.length ? state.salgados.join(', ') : '—');
        lines.push('');
        lines.push('💰 Valor (referência do cardápio):');
        lines.push(fmtMoney(kit.vista) + ' à vista');
        lines.push(fmtMoney(kit.parc) + ' em até 3x');
        lines.push('');
        lines.push('— Pedido montado pelo site Kit Festa 2026.');
        return lines.join('\n');
    }

    function updateResumo() {
        var kit = currentKit();
        var box = document.getElementById('kf-resumo-body');
        var live = document.getElementById('kf-resumo-live');
        var btn = document.getElementById('kf-btn-wa');
        if (!box) return;

        if (!kit) {
            box.innerHTML = '<p class="kf-resumo-placeholder">Escolha um kit acima para ver o resumo e liberar o envio.</p>';
            if (btn) {
                btn.disabled = true;
                btn.setAttribute('aria-disabled', 'true');
            }
            if (live) live.textContent = '';
            return;
        }

        var miss = [];
        if (!state.massa) miss.push('massa do bolo');
        if (state.recheios.length < 1) miss.push('ao menos 1 recheio (até ' + RECHEIO_MAX + ')');
        if (state.recheios.length > RECHEIO_MAX) miss.push('no máximo ' + RECHEIO_MAX + ' recheios');
        if (state.doces.length !== kit.docesSabores) miss.push(kit.docesSabores + ' sabores de doces');
        if (state.salgados.length !== kit.salgadosSabores) miss.push(kit.salgadosSabores + ' sabores de salgados');

        var html = '';
        html += '<dl class="kf-resumo-dl">';
        html += '<div><dt>Kit</dt><dd>' + kit.p + ' pessoas</dd></div>';
        html += '<div><dt>Bolo</dt><dd>' + kit.bolo + ' · Chantilly</dd></div>';
        html += '<div><dt>Inclusões</dt><dd>' + kit.doces + ' doces · ' + kit.salgados + ' salgados</dd></div>';
        html += '<div><dt>Massa</dt><dd>' + (state.massa ? state.massa : '<span class="kf-pend">Escolher</span>') + '</dd></div>';
        html +=
            '<div><dt>Recheios</dt><dd>' +
            (state.recheios.length ? state.recheios.join(', ') : '<span class="kf-pend">Escolher (até ' + RECHEIO_MAX + ')</span>') +
            '</dd></div>';
        html +=
            '<div><dt>Adicionais</dt><dd>' +
            (state.adicionais.length ? state.adicionais.join(', ') : '<span class="kf-muted">Opcional (até ' + ADICIONAL_MAX + ')</span>') +
            '</dd></div>';
        html +=
            '<div><dt>Doces</dt><dd>' +
            (state.doces.length ? state.doces.join(', ') : '<span class="kf-pend">' + kit.docesSabores + ' sabores</span>') +
            '</dd></div>';
        html +=
            '<div><dt>Salgados</dt><dd>' +
            (state.salgados.length ? state.salgados.join(', ') : '<span class="kf-pend">' + kit.salgadosSabores + ' sabores</span>') +
            '</dd></div>';
        html += '</dl>';
        html += '<p class="kf-resumo-preco"><span>À vista</span> <strong>' + fmtMoney(kit.vista) + '</strong></p>';
        html += '<p class="kf-resumo-preco kf-resumo-preco--parc"><span>Até 3x</span> <strong>' + fmtMoney(kit.parc) + '</strong></p>';

        if (miss.length) {
            html += '<p class="kf-resumo-falta" role="status">Falta: ' + miss.join('; ') + '.</p>';
        } else {
            html += '<p class="kf-resumo-ok" role="status">Pedido completo. Pode enviar pelo WhatsApp.</p>';
        }

        box.innerHTML = html;

        if (live) {
            live.textContent = miss.length ? 'Resumo atualizado. Itens pendentes: ' + miss.join(', ') + '.' : 'Resumo completo.';
        }

        if (btn) {
            var ok = isComplete();
            btn.disabled = !ok;
            btn.setAttribute('aria-disabled', ok ? 'false' : 'true');
        }
    }

    function onWhatsAppClick() {
        if (!isComplete()) return;
        var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(buildWhatsAppText());
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    function init() {
        els.monteSection = document.getElementById('monte-seu-kit');
        renderKitGrid();
        if (els.monteSection) {
            els.monteSection.setAttribute('hidden', 'hidden');
            els.monteSection.classList.remove('is-active');
        }
        var btnWa = document.getElementById('kf-btn-wa');
        if (btnWa) btnWa.addEventListener('click', onWhatsAppClick);

        updateContextBanner();
        updateResumo();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
