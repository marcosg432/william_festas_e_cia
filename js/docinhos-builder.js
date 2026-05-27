/**
 * Docinhos 2026 — seleção por sabor com preço unitário e múltiplos de 25.
 * Depende de carrinho.js (window.adicionarCarrinho).
 */
(function () {
    'use strict';

    var STEP_QTD = 25;

    var GRUPOS = [
        {
            titulo: 'Clássicos',
            precoUnit: 1.49,
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
            titulo: 'Especiais',
            precoUnit: 1.59,
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
            titulo: 'Gourmet',
            precoUnit: 1.69,
            sabores: ['Casadinho', 'Napolitano', 'Stikadinho', 'Oreo', 'Perolados']
        },
        {
            titulo: 'Premium',
            precoUnit: 1.79,
            sabores: ['Ninho c/ nutella', 'Brigadeiro confeti', 'Brigadeiro 70%', 'Surpresa de uva']
        }
    ];

    var state = {};

    function el(id) {
        return document.getElementById(id);
    }

    function escapeHtml(str) {
        var d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function money(n) {
        return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
    }

    function keyFor(grupo, sabor) {
        return grupo.titulo + '::' + sabor;
    }

    function findSaborCard(key) {
        var cards = document.querySelectorAll('.dh-sabor-item');
        for (var i = 0; i < cards.length; i++) {
            if (cards[i].getAttribute('data-sabor-key') === key) return cards[i];
        }
        return null;
    }

    function getItens() {
        var itens = [];
        for (var i = 0; i < GRUPOS.length; i++) {
            var g = GRUPOS[i];
            for (var j = 0; j < g.sabores.length; j++) {
                var sabor = g.sabores[j];
                var key = keyFor(g, sabor);
                var quantidade = state[key] || 0;
                itens.push({
                    key: key,
                    sabor: sabor,
                    grupo: g.titulo,
                    precoUnit: g.precoUnit,
                    quantidade: quantidade,
                    subtotal: quantidade * g.precoUnit
                });
            }
        }
        return itens;
    }

    function totais() {
        var itens = getItens();
        var selecionados = [];
        var quantidade = 0;
        var total = 0;
        for (var i = 0; i < itens.length; i++) {
            if (itens[i].quantidade > 0) {
                selecionados.push(itens[i]);
                quantidade += itens[i].quantidade;
                total += itens[i].subtotal;
            }
        }
        return { itens: selecionados, quantidade: quantidade, total: total };
    }

    function setQuantidade(key, qtd) {
        var n = parseInt(String(qtd), 10);
        if (!Number.isFinite(n) || n < 0) n = 0;
        n = Math.floor(n / STEP_QTD) * STEP_QTD;
        if (n <= 0) {
            delete state[key];
        } else {
            state[key] = n;
        }
        syncUI();
    }

    function renderSabores() {
        var wrap = el('dh-sabores-chips');
        if (!wrap) return;
        var html = '';
        for (var i = 0; i < GRUPOS.length; i++) {
            var g = GRUPOS[i];
            html += '<section class="dh-sabor-group">';
            html += '<header class="dh-sabor-group__head">';
            html += '<p class="dh-sabor-group__title">' + escapeHtml(g.titulo) + '</p>';
            html += '<p class="dh-sabor-group__price">' + money(g.precoUnit) + ' unidade</p>';
            html += '</header>';
            html += '<div class="dh-sabor-items">';
            for (var j = 0; j < g.sabores.length; j++) {
                var sabor = g.sabores[j];
                var key = keyFor(g, sabor);
                html += '<article class="dh-sabor-item" data-sabor-key="' + escapeHtml(key) + '">';
                html += '<div class="dh-sabor-item__main">';
                html += '<h3 class="dh-sabor-item__nome">' + escapeHtml(sabor) + '</h3>';
                html += '<p class="dh-sabor-item__meta">' + escapeHtml(g.titulo) + ' · ' + money(g.precoUnit) + ' unidade · mínimo 25</p>';
                html += '</div>';
                html += '<div class="dh-sabor-item__controls">';
                html += '<button type="button" class="dh-qty-btn" data-action="minus" aria-label="Diminuir ' + escapeHtml(sabor) + '">-</button>';
                html += '<span class="dh-qty-value" data-role="qty">0</span>';
                html += '<button type="button" class="dh-qty-btn" data-action="plus" aria-label="Adicionar ' + escapeHtml(sabor) + '">+</button>';
                html += '</div>';
                html += '<p class="dh-sabor-item__subtotal" data-role="subtotal">Subtotal: R$ 0,00</p>';
                html += '</article>';
            }
            html += '</div></section>';
        }
        wrap.innerHTML = html;
    }

    function syncUI() {
        var itens = getItens();
        for (var i = 0; i < itens.length; i++) {
            var item = itens[i];
            var card = findSaborCard(item.key);
            if (!card) continue;
            card.classList.toggle('is-selected', item.quantidade > 0);
            var qty = card.querySelector('[data-role="qty"]');
            var subtotal = card.querySelector('[data-role="subtotal"]');
            if (qty) qty.textContent = String(item.quantidade);
            if (subtotal) subtotal.textContent = 'Subtotal: ' + money(item.subtotal);
        }
        updateResumo();
    }

    function updateResumo() {
        var box = el('dh-resumo-body');
        var btn = el('dh-btn-carrinho');
        if (!box) return;
        var resumo = totais();
        if (!resumo.itens.length) {
            box.innerHTML = '<p class="dh-resumo-placeholder">Escolha os sabores. Cada sabor começa em 25 unidades e aumenta de 25 em 25.</p>';
            if (btn) btn.disabled = true;
            return;
        }
        var html = '<div class="dh-resumo-pedido">';
        html += '<p class="dh-resumo-title">Resumo do pedido</p>';
        html += '<ul class="dh-resumo-lista">';
        for (var i = 0; i < resumo.itens.length; i++) {
            var item = resumo.itens[i];
            html += '<li><span>' + item.quantidade + ' ' + escapeHtml(item.sabor) + '</span><strong>' + money(item.subtotal) + '</strong></li>';
        }
        html += '</ul>';
        html += '<div class="dh-resumo-total"><span>Total</span><strong>' + money(resumo.total) + '</strong></div>';
        html += '</div>';
        box.innerHTML = html;
        if (btn) btn.disabled = false;
    }

    function onQtyClick(e) {
        var btn = e.target.closest('.dh-qty-btn');
        if (!btn) return;
        var card = btn.closest('.dh-sabor-item');
        if (!card) return;
        var key = card.getAttribute('data-sabor-key');
        var atual = state[key] || 0;
        var action = btn.getAttribute('data-action');
        setQuantidade(key, action === 'plus' ? atual + STEP_QTD : atual - STEP_QTD);
    }

    function onAddCarrinho() {
        var resumo = totais();
        if (!resumo.itens.length || typeof window.adicionarCarrinho !== 'function') return;
        var linhas = [];
        for (var i = 0; i < resumo.itens.length; i++) {
            var item = resumo.itens[i];
            linhas.push(item.quantidade + ' ' + item.sabor + ' (' + money(item.precoUnit) + '/un = ' + money(item.subtotal) + ')');
        }
        window.adicionarCarrinho('Docinhos 2026 - seleção personalizada', resumo.total, 1, {
            detalhes: linhas.join(' | '),
            unidadePreco: 'pedido',
            hintQuantidade: 'Quantidade = pedido montado',
            quantidadeInicial: 1
        });
        state = {};
        syncUI();
    }

    function init() {
        if (!document.body.classList.contains('pagina-docinhos')) return;
        if (!el('dh-monte-panel')) return;
        var panel = el('dh-monte-panel');
        var resumoW = el('dh-resumo-wrap');
        if (panel) {
            panel.hidden = false;
            panel.classList.add('is-visible');
        }
        if (resumoW) resumoW.hidden = false;
        renderSabores();
        syncUI();
        var wrap = el('dh-sabores-chips');
        if (wrap) wrap.addEventListener('click', onQtyClick);
        var addBtn = el('dh-btn-carrinho');
        if (addBtn) addBtn.addEventListener('click', onAddCarrinho);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
