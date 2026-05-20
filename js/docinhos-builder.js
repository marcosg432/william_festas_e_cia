/**
 * Docinhos 2026 — montador de cento (até 4 sabores de qualquer faixa).
 * Depende de carrinho.js (adicionarCarrinho no window).
 */
(function () {
    'use strict';

    var MAX_SABORES = 4;

    var CATEGORIAS = [
        {
            id: 'c149',
            preco: 149,
            titulo: 'R$ 149 o cento',
            resumo: 'Clássicos da mesa',
            sabores: [
                'Brigadeiro tradicional',
                'Brigadeiro branco',
                'Beijinho de coco (sem cravo)',
                'Beijinho coco queimado',
                'Cajuzinho de amendoim',
                'Bicho de pé',
                'Brigadeiro de ninho',
                'Brigadeiro de ninho queimado',
                'Brigadeiro com castanhas'
            ]
        },
        {
            id: 'c159',
            preco: 159,
            titulo: 'R$ 159 o cento',
            resumo: 'Sabores especiais',
            sabores: [
                'Leite ninho',
                'Brigadeiro bool',
                'Brigadeiro de churros',
                'Brigadeiro trad. com coco',
                'Brigadeiro farinha láctea',
                'Brigadeiro de café',
                'Brigadeiro milho verde'
            ]
        },
        {
            id: 'c169',
            preco: 169,
            titulo: 'R$ 169 o cento',
            resumo: 'Combinações gourmet',
            sabores: ['Casadinho', 'Napolitano', 'Stikadinho', 'Oreo', 'Perolados']
        },
        {
            id: 'c179',
            preco: 179,
            titulo: 'R$ 179 o cento',
            resumo: 'Linha premium',
            sabores: ['Ninho c/ nutella', 'Brigadeiro confeti', 'Brigadeiro 70%', 'Surpresa de uva']
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
        var wrap = el('dh-sabores-chips');
        if (!wrap) return;
        wrap.innerHTML = '';
        if (!getCat()) return;
        for (var i = 0; i < CATEGORIAS.length; i++) {
            var cat = CATEGORIAS[i];
            var group = document.createElement('div');
            group.className = 'dh-sabor-group';

            var title = document.createElement('p');
            title.className = 'dh-sabor-group__title';
            title.textContent = cat.titulo;
            group.appendChild(title);

            var list = document.createElement('div');
            list.className = 'dh-sabor-group__chips';
            for (var j = 0; j < cat.sabores.length; j++) {
                var s = cat.sabores[j];
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'dh-chip';
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
            if (state.sabores.length >= MAX_SABORES) return;
            state.sabores.push(key);
        }
        syncChipsUI();
        updateResumo();
    }

    function syncChipsUI() {
        var cat = getCat();
        var wrap = el('dh-sabores-chips');
        if (!wrap || !cat) return;
        var atMax = state.sabores.length >= MAX_SABORES;
        var chips = wrap.querySelectorAll('.dh-chip');
        for (var i = 0; i < chips.length; i++) {
            var b = chips[i];
            var key = b.getAttribute('data-sabor-key');
            var on = state.sabores.indexOf(key) >= 0;
            b.classList.toggle('is-on', on);
            b.classList.toggle('is-disabled', atMax && !on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
            b.setAttribute('aria-disabled', atMax && !on ? 'true' : 'false');
        }
        var hint = el('dh-sabor-limite');
        if (hint) {
            if (atMax) {
                hint.textContent = 'Você atingiu o limite de sabores deste cento.';
                hint.hidden = false;
            } else {
                hint.textContent = '';
                hint.hidden = true;
            }
        }
        var cnt = el('dh-contador');
        if (cnt) {
            cnt.textContent = state.sabores.length + ' de ' + MAX_SABORES + ' sabores selecionados';
        }
    }

    function selectCategoria(id) {
        state.catId = id;
        state.sabores = [];
        var cards = document.querySelectorAll('.dh-cat-card');
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('is-selected', cards[i].getAttribute('data-cat-id') === id);
        }
        var panel = el('dh-monte-panel');
        if (panel) {
            panel.hidden = false;
            panel.classList.add('is-visible');
        }
        var titulo = el('dh-monte-cat-titulo');
        var cat = getCat();
        if (titulo && cat) titulo.textContent = cat.titulo;
        renderChips();
        updateResumo();
        var resumoW = el('dh-resumo-wrap');
        if (resumoW) resumoW.hidden = false;
        requestAnimationFrame(function () {
            if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    function updateResumo() {
        var cat = getCat();
        var box = el('dh-resumo-body');
        var btn = el('dh-btn-carrinho');
        if (!box) return;
        if (!cat) {
            box.innerHTML = '<p class="dh-resumo-placeholder">Escolha o cento e até quatro sabores.</p>';
            if (btn) btn.disabled = true;
            return;
        }
        var html = '<dl class="dh-resumo-dl">';
        html += '<div><dt>Cento escolhido</dt><dd>' + escapeHtml(cat.titulo) + '</dd></div>';
        html += '<div><dt>Sabores</dt><dd>';
        if (state.sabores.length) {
            html += '<ul class="dh-resumo-lista">';
            for (var i = 0; i < state.sabores.length; i++) {
                var item = getSaborSelecionado(state.sabores[i]);
                if (item) {
                    html += '<li>' + escapeHtml(item.sabor) + ' <small>(' + escapeHtml(item.categoria) + ')</small></li>';
                }
            }
            html += '</ul>';
        } else {
            html += '<span class="dh-resumo-pendente">Selecione de 1 a ' + MAX_SABORES + ' sabores.</span>';
        }
        html += '</dd></div>';
        html += '<div><dt>Preço do cento</dt><dd>R$ ' + cat.preco + ',00</dd></div>';
        html += '</dl>';
        box.innerHTML = html;
        var ok = state.sabores.length >= 1 && state.sabores.length <= MAX_SABORES;
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
        var sabores = [];
        for (var i = 0; i < state.sabores.length; i++) {
            var item = getSaborSelecionado(state.sabores[i]);
            if (item) sabores.push(item.sabor + ' (' + item.categoria + ')');
        }
        var detalhes = 'Sabores: ' + sabores.join(', ');
        var nome = 'Docinhos 2026 — ' + cat.titulo;
        window.adicionarCarrinho(nome, cat.preco, 1, {
            detalhes: detalhes,
            precoPorCentena: true
        });
        state.sabores = [];
        syncChipsUI();
        updateResumo();
    }

    function bind() {
        var btns = document.querySelectorAll('.dh-cat-select');
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', function () {
                var card = this.closest('.dh-cat-card');
                if (!card) return;
                var id = card.getAttribute('data-cat-id');
                if (id) selectCategoria(id);
            });
        }
        var addBtn = el('dh-btn-carrinho');
        if (addBtn) addBtn.addEventListener('click', onAddCarrinho);
    }

    function init() {
        if (!document.body.classList.contains('pagina-docinhos')) return;
        if (!el('dh-monte-panel')) return;
        bind();
        updateResumo();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
