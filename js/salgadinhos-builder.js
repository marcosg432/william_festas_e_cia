/**
 * Salgadinhos 2026 — montador de cento (até 4 sabores de qualquer faixa).
 * Depende de carrinho.js (window.adicionarCarrinho).
 */
(function () {
    'use strict';

    var MAX_SABORES_GLOBAL = 4;

    var CATEGORIAS = [
        {
            id: 's65',
            preco: 65,
            titulo: 'R$ 65 o cento',
            etiqueta: 'Tradicional',
            sabores: [
                'Coxinha de frango',
                'Kibe',
                'Travesseirinho de milho',
                'Empanado salsicha',
                'Risole de ricota e milho',
                'Risole de carne',
                'Pastel de carne',
                'Pastel de pizza',
                'Pastel frango'
            ]
        },
        {
            id: 's68mix',
            preco: 68,
            titulo: 'R$ 68 o cento — Cremosos & queijos',
            etiqueta: 'Cremosos & queijos',
            sabores: [
                'Maravilha de milho',
                'Bolinha de queijo',
                'Pastel queijo',
                'Travesseirinho presunto e mussarela'
            ]
        },
        {
            id: 's68assados',
            preco: 68,
            titulo: 'Assados — R$ 68 o cento',
            etiqueta: 'Assados',
            sabores: [
                'Enroladinho de salsicha',
                'Pãozinho de Ricota',
                'Esfirra de carne',
                'Esfirra calabresa',
                'Pizza presunto e queijo',
                'Pizza calabresa e queijo'
            ]
        },
        {
            id: 's70esp',
            preco: 70,
            titulo: 'Especiais — R$ 70 o cento',
            etiqueta: 'Especiais',
            sabores: [
                'Coxinha de frango cremosa',
                'Coxinha cremosa cheddar',
                'Kibe c/ requeijão',
                'Espetinho de frango',
                'Empada de frango',
                'Empada de palmito',
                'Pizza mussarela'
            ]
        },
        {
            id: 's75prem',
            preco: 75,
            titulo: 'Especiais premium — R$ 75 o cento',
            etiqueta: 'Premium',
            sabores: ['Espetinho frango c/ bacon']
        }
    ];

    var state = {
        catId: null,
        sabores: []
    };

    function el(id) {
        return document.getElementById(id);
    }

    function getCat() {
        if (!state.catId) return null;
        for (var i = 0; i < CATEGORIAS.length; i++) {
            if (CATEGORIAS[i].id === state.catId) return CATEGORIAS[i];
        }
        return null;
    }

    function getSaborKey(cat, sabor) {
        return cat.id + '::' + sabor;
    }

    function getSaborSelecionado(key) {
        for (var i = 0; i < CATEGORIAS.length; i++) {
            var cat = CATEGORIAS[i];
            for (var j = 0; j < cat.sabores.length; j++) {
                if (getSaborKey(cat, cat.sabores[j]) === key) {
                    return {
                        sabor: cat.sabores[j],
                        categoria: cat.titulo
                    };
                }
            }
        }
        return null;
    }

    function renderChips() {
        var wrap = el('sg-sabores-chips');
        if (!wrap) return;
        wrap.innerHTML = '';
        if (!getCat()) return;
        for (var i = 0; i < CATEGORIAS.length; i++) {
            var cat = CATEGORIAS[i];
            var group = document.createElement('div');
            group.className = 'sg-sabor-group';

            var title = document.createElement('p');
            title.className = 'sg-sabor-group__title';
            title.textContent = cat.titulo;
            group.appendChild(title);

            var list = document.createElement('div');
            list.className = 'sg-sabor-group__chips';
            for (var j = 0; j < cat.sabores.length; j++) {
                var s = cat.sabores[j];
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'sg-chip';
                btn.setAttribute('data-sabor-key', getSaborKey(cat, s));
                btn.textContent = s;
                btn.addEventListener('click', onChipClick);
                list.appendChild(btn);
            }
            group.appendChild(list);
            wrap.appendChild(group);
        }
        syncChipsUI();
    }

    function onChipClick() {
        if (!getCat()) return;
        var key = this.getAttribute('data-sabor-key');
        if (!key) return;
        var idx = state.sabores.indexOf(key);
        if (idx >= 0) {
            state.sabores.splice(idx, 1);
        } else {
            if (state.sabores.length >= MAX_SABORES_GLOBAL) return;
            state.sabores.push(key);
        }
        syncChipsUI();
        updateResumo();
    }

    function syncChipsUI() {
        var cat = getCat();
        var wrap = el('sg-sabores-chips');
        if (!wrap || !cat) return;
        var atMax = state.sabores.length >= MAX_SABORES_GLOBAL;
        var chips = wrap.querySelectorAll('.sg-chip');
        for (var i = 0; i < chips.length; i++) {
            var b = chips[i];
            var key = b.getAttribute('data-sabor-key');
            var on = state.sabores.indexOf(key) >= 0;
            b.classList.toggle('is-on', on);
            b.classList.toggle('is-disabled', atMax && !on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
            b.setAttribute('aria-disabled', atMax && !on ? 'true' : 'false');
        }
        var hint = el('sg-sabor-limite');
        if (hint) {
            if (atMax) {
                hint.textContent = 'Você atingiu o limite de sabores deste cento.';
                hint.hidden = false;
            } else {
                hint.textContent = '';
                hint.hidden = true;
            }
        }
        var cnt = el('sg-contador');
        if (cnt) {
            cnt.textContent =
                state.sabores.length + ' de ' + MAX_SABORES_GLOBAL + ' sabores selecionados';
        }
    }

    function selectCategoria(id) {
        state.catId = id;
        state.sabores = [];
        var cards = document.querySelectorAll('.sg-cat-card');
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('is-selected', cards[i].getAttribute('data-cat-id') === id);
        }
        var panel = el('sg-monte-panel');
        if (panel) {
            panel.hidden = false;
            panel.classList.add('is-visible');
        }
        var titulo = el('sg-monte-cat-titulo');
        var cat = getCat();
        if (titulo && cat) titulo.textContent = cat.titulo;
        renderChips();
        updateResumo();
        var resumoW = el('sg-resumo-wrap');
        if (resumoW) resumoW.hidden = false;
        requestAnimationFrame(function () {
            if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    function updateResumo() {
        var cat = getCat();
        var box = el('sg-resumo-body');
        var btn = el('sg-btn-carrinho');
        if (!box) return;
        if (!cat) {
            box.innerHTML =
                '<p class="sg-resumo-placeholder">Escolha o cento e até quatro sabores.</p>';
            if (btn) btn.disabled = true;
            return;
        }
        var html = '<dl class="sg-resumo-dl">';
        html += '<div><dt>Cento escolhido</dt><dd>' + escapeHtml(cat.titulo) + '</dd></div>';
        html += '<div><dt>Sabores</dt><dd>';
        if (state.sabores.length) {
            html += '<ul class="sg-resumo-lista">';
            for (var i = 0; i < state.sabores.length; i++) {
                var item = getSaborSelecionado(state.sabores[i]);
                if (item) {
                    html += '<li>' + escapeHtml(item.sabor) + ' <small>(' + escapeHtml(item.categoria) + ')</small></li>';
                }
            }
            html += '</ul>';
        } else {
            html +=
                '<span class="sg-resumo-pendente">Selecione de 1 a ' +
                MAX_SABORES_GLOBAL +
                ' sabore(s).</span>';
        }
        html += '</dd></div>';
        html += '<div><dt>Preço do cento</dt><dd>R$ ' + cat.preco + ',00</dd></div>';
        html += '</dl>';
        box.innerHTML = html;
        var ok = state.sabores.length >= 1 && state.sabores.length <= MAX_SABORES_GLOBAL;
        if (btn) btn.disabled = !ok;
    }

    function escapeHtml(str) {
        var d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function onAddCarrinho() {
        var cat = getCat();
        if (!cat || state.sabores.length < 1) return;
        if (typeof window.adicionarCarrinho !== 'function') return;
        if (state.sabores.length > MAX_SABORES_GLOBAL) return;
        var sabores = [];
        for (var i = 0; i < state.sabores.length; i++) {
            var item = getSaborSelecionado(state.sabores[i]);
            if (item) sabores.push(item.sabor + ' (' + item.categoria + ')');
        }
        var detalhes = 'Sabores: ' + sabores.join(', ');
        var nome = 'Salgadinhos 2026 — ' + cat.titulo;
        window.adicionarCarrinho(nome, cat.preco, 1, {
            detalhes: detalhes,
            precoPorCentena: true
        });
        state.sabores = [];
        syncChipsUI();
        updateResumo();
    }

    function bind() {
        var btns = document.querySelectorAll('.sg-cat-select');
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', function () {
                var card = this.closest('.sg-cat-card');
                if (!card) return;
                var id = card.getAttribute('data-cat-id');
                if (id) selectCategoria(id);
            });
        }
        var addBtn = el('sg-btn-carrinho');
        if (addBtn) addBtn.addEventListener('click', onAddCarrinho);
    }

    function init() {
        if (!document.body.classList.contains('pagina-salgadinhos')) return;
        if (!el('sg-monte-panel')) return;
        bind();
        updateResumo();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
