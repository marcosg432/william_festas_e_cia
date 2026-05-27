/**
 * Salgadinhos 2026 — seleção por sabor com preço unitário e múltiplos de 25.
 * Depende de carrinho.js (window.adicionarCarrinho).
 */
(function () {
    'use strict';

    var STEP_QTD = 25;

    var GRUPOS = [
        {
            titulo: 'Tradicional',
            precoUnit: 0.65,
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
            titulo: 'Cremosos & queijos',
            precoUnit: 0.68,
            sabores: [
                'Maravilha de milho',
                'Bolinha de queijo',
                'Pastel queijo',
                'Travesseirinho presunto e mussarela'
            ]
        },
        {
            titulo: 'Assados',
            precoUnit: 0.68,
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
            titulo: 'Especiais',
            precoUnit: 0.70,
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
            titulo: 'Premium',
            precoUnit: 0.75,
            sabores: ['Espetinho frango c/ bacon']
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
        var cards = document.querySelectorAll('.sg-sabor-item');
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
        var wrap = el('sg-sabores-chips');
        if (!wrap) return;
        var html = '';
        for (var i = 0; i < GRUPOS.length; i++) {
            var g = GRUPOS[i];
            html += '<section class="sg-sabor-group">';
            html += '<header class="sg-sabor-group__head">';
            html += '<p class="sg-sabor-group__title">' + escapeHtml(g.titulo) + '</p>';
            html += '<p class="sg-sabor-group__price">' + money(g.precoUnit) + ' unidade</p>';
            html += '</header>';
            html += '<div class="sg-sabor-items">';
            for (var j = 0; j < g.sabores.length; j++) {
                var sabor = g.sabores[j];
                var key = keyFor(g, sabor);
                html += '<article class="sg-sabor-item" data-sabor-key="' + escapeHtml(key) + '">';
                html += '<div class="sg-sabor-item__main">';
                html += '<h3 class="sg-sabor-item__nome">' + escapeHtml(sabor) + '</h3>';
                html += '<p class="sg-sabor-item__meta">' + escapeHtml(g.titulo) + ' · ' + money(g.precoUnit) + ' unidade · mínimo 25</p>';
                html += '</div>';
                html += '<div class="sg-sabor-item__controls">';
                html += '<button type="button" class="sg-qty-btn" data-action="minus" aria-label="Diminuir ' + escapeHtml(sabor) + '">-</button>';
                html += '<span class="sg-qty-value" data-role="qty">0</span>';
                html += '<button type="button" class="sg-qty-btn" data-action="plus" aria-label="Adicionar ' + escapeHtml(sabor) + '">+</button>';
                html += '</div>';
                html += '<p class="sg-sabor-item__subtotal" data-role="subtotal">Subtotal: R$ 0,00</p>';
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
        var box = el('sg-resumo-body');
        var btn = el('sg-btn-carrinho');
        if (!box) return;
        var resumo = totais();
        if (!resumo.itens.length) {
            box.innerHTML = '<p class="sg-resumo-placeholder">Escolha os sabores. Cada sabor começa em 25 unidades e aumenta de 25 em 25.</p>';
            if (btn) btn.disabled = true;
            return;
        }
        var html = '<div class="sg-resumo-pedido">';
        html += '<p class="sg-resumo-title">Resumo do pedido</p>';
        html += '<ul class="sg-resumo-lista">';
        for (var i = 0; i < resumo.itens.length; i++) {
            var item = resumo.itens[i];
            html += '<li><span>' + item.quantidade + ' ' + escapeHtml(item.sabor) + '</span><strong>' + money(item.subtotal) + '</strong></li>';
        }
        html += '</ul>';
        html += '<div class="sg-resumo-total"><span>Total</span><strong>' + money(resumo.total) + '</strong></div>';
        html += '</div>';
        box.innerHTML = html;
        if (btn) btn.disabled = false;
    }

    function onQtyClick(e) {
        var btn = e.target.closest('.sg-qty-btn');
        if (!btn) return;
        var card = btn.closest('.sg-sabor-item');
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
        window.adicionarCarrinho('Salgadinhos 2026 - seleção personalizada', resumo.total, 1, {
            detalhes: linhas.join(' | '),
            unidadePreco: 'pedido',
            hintQuantidade: 'Quantidade = pedido montado',
            quantidadeInicial: 1
        });
        state = {};
        syncUI();
    }

    function init() {
        if (!document.body.classList.contains('pagina-salgadinhos')) return;
        if (!el('sg-monte-panel')) return;
        var panel = el('sg-monte-panel');
        var resumoW = el('sg-resumo-wrap');
        if (panel) {
            panel.hidden = false;
            panel.classList.add('is-visible');
        }
        if (resumoW) resumoW.hidden = false;
        renderSabores();
        syncUI();
        var wrap = el('sg-sabores-chips');
        if (wrap) wrap.addEventListener('click', onQtyClick);
        var addBtn = el('sg-btn-carrinho');
        if (addBtn) addBtn.addEventListener('click', onAddCarrinho);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
