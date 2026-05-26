/**
 * bolos-especiais.js — Bolos Especiais (por kg) + Bolos na Taça (bolos-personalizados.html)
 */
(function () {
    'use strict';

    var modalKgAberto = false;
    var modalTacaAberto = false;

    var BOLOS_ESPECIAIS = [
        {
            id: 'floresta-negra',
            nome: 'Floresta Negra',
            precoKg: 98,
            desc: 'Massa chocolate, creme de chantilly e cereja em calda com raspas de chocolate.'
        },
        {
            id: 'brigadeiro-nozes',
            nome: 'Brigadeiro de Nozes',
            precoKg: 88,
            desc: 'Massa branca ou preta, brigadeiro branco com nozes e cobertura com chantilly e nozes.'
        },
        {
            id: 'creme-pistache',
            nome: 'Creme Pistache',
            precoKg: 110,
            desc: 'Massa preta, creme de chocolate branco e pasta de pistache com pistache triturado.'
        },
        {
            id: 'nutella',
            nome: 'Nutella',
            precoKg: 125,
            desc: 'Massa preta, creme de Nutella pura e cobertura com chocolate amargo.'
        },
        {
            id: 'trufado-meio-amargo',
            nome: 'Trufado Meio Amargo',
            precoKg: 110,
            desc: 'Massa preta, recheio trufado com ganache amargo e raspas amargas.'
        },
        {
            id: 'kinder',
            nome: 'Kinder',
            precoKg: 125,
            desc: 'Massa mesclada, recheio kinder e pedaços de kinder bueno.'
        },
        {
            id: 'kitkat',
            nome: 'KitKat',
            precoKg: 99,
            desc: 'Massa chocolate, recheio cremoso de KitKat e cobertura com KitKat.'
        },
        {
            id: 'ferrero',
            nome: 'Ferrero',
            precoKg: 125,
            desc: 'Massa chocolate, recheio creme de avelã com avelãs trituradas.'
        }
    ];

    var BOLOS_TACA = [
        {
            id: 'sonho-valsa',
            nome: 'Sonho de Valsa',
            desc: 'Massa preta, creme bombom e sonho de valsa triturado.'
        },
        {
            id: 'creme-morango',
            nome: 'Creme com Morango',
            desc: 'Massa branca, creme vinho com morango.'
        },
        {
            id: 'frutas-tropicais',
            nome: 'Frutas Tropicais',
            desc: 'Massa branca, creme branco, morango, abacaxi, uva e kiwi.'
        },
        {
            id: 'coco-abacaxi',
            nome: 'Coco com Abacaxi',
            desc: 'Massa branca, creme de coco e abacaxi em calda.'
        }
    ];

    var boloKgAtual = null;
    var boloTacaAtual = null;

    function escapeHtml(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function formatPreco(n) {
        return 'R$ ' + Number(n).toFixed(2).replace('.', ',');
    }

    function syncBesOpt(container, selector) {
        if (!container) return;
        container.querySelectorAll(selector).forEach(function (lab) {
            var inp = lab.querySelector('input[type="radio"]');
            lab.classList.toggle('is-selected', inp && inp.checked);
        });
    }

    function renderGrids() {
        var gridEsp = document.getElementById('bes-grid-especiais');
        var gridTaca = document.getElementById('bes-grid-taca');
        if (gridEsp) {
            gridEsp.innerHTML = '';
            for (var i = 0; i < BOLOS_ESPECIAIS.length; i++) {
                var b = BOLOS_ESPECIAIS[i];
                var art = document.createElement('article');
                art.className = 'bes-card';
                art.setAttribute('data-bes-id', b.id);
                art.innerHTML =
                    '<div class="bes-card__body">' +
                    '<header class="bes-card__head">' +
                    '<span class="bes-card__badge">Exclusivo</span>' +
                    '<h3 class="bes-card__title">' +
                    escapeHtml(b.nome) +
                    '</h3>' +
                    '</header>' +
                    '<div class="bes-card__divider" aria-hidden="true"></div>' +
                    '<p class="bes-card__preco">' +
                    formatPreco(b.precoKg) +
                    ' <span>/ kg</span></p>' +
                    '<p class="bes-card__desc">' +
                    escapeHtml(b.desc) +
                    '</p>' +
                    '<button type="button" class="bes-btn bes-btn--kg">Personalizar bolo</button>' +
                    '</div>';
                art.querySelector('.bes-btn--kg').addEventListener('click', function (ev) {
                    var card = ev.target.closest('.bes-card');
                    if (!card) return;
                    abrirModalKg(card.getAttribute('data-bes-id'));
                });
                gridEsp.appendChild(art);
            }
        }
        if (gridTaca) {
            gridTaca.innerHTML = '';
            for (var j = 0; j < BOLOS_TACA.length; j++) {
                var t = BOLOS_TACA[j];
                var artT = document.createElement('article');
                artT.className = 'bes-card';
                artT.setAttribute('data-bes-taca-id', t.id);
                artT.innerHTML =
                    '<div class="bes-card__body">' +
                    '<header class="bes-card__head">' +
                    '<span class="bes-card__badge">Na taça</span>' +
                    '<h3 class="bes-card__title">' +
                    escapeHtml(t.nome) +
                    '</h3>' +
                    '</header>' +
                    '<div class="bes-card__divider" aria-hidden="true"></div>' +
                    '<p class="bes-card__desc">' +
                    escapeHtml(t.desc) +
                    '</p>' +
                    '<div class="bes-card__precos-duo">' +
                    '<div class="bes-card__preco-item"><span class="bes-card__preco-label">Taça própria 1250 ml</span><span class="bes-card__preco-val">R$ 99,00</span></div>' +
                    '<div class="bes-card__preco-item"><span class="bes-card__preco-label">Taça fornecida</span><span class="bes-card__preco-val">R$ 120,00</span></div>' +
                    '</div>' +
                    '<button type="button" class="bes-btn bes-btn--taca">Adicionar ao carrinho</button>' +
                    '</div>';
                artT.querySelector('.bes-btn--taca').addEventListener('click', function (ev) {
                    var card = ev.target.closest('.bes-card');
                    if (!card) return;
                    abrirModalTaca(card.getAttribute('data-bes-taca-id'));
                });
                gridTaca.appendChild(artT);
            }
        }
    }

    function acharEspecial(id) {
        for (var i = 0; i < BOLOS_ESPECIAIS.length; i++) {
            if (BOLOS_ESPECIAIS[i].id === id) return BOLOS_ESPECIAIS[i];
        }
        return null;
    }

    function acharTaca(id) {
        for (var k = 0; k < BOLOS_TACA.length; k++) {
            if (BOLOS_TACA[k].id === id) return BOLOS_TACA[k];
        }
        return null;
    }

    function kgSelecionado() {
        var el = document.querySelector('input[name="bes-kg-peso"]:checked');
        return el ? parseInt(el.value, 10) || 1 : 1;
    }

    function atualizarResumoKg() {
        if (!boloKgAtual) return;
        var kg = kgSelecionado();
        var total = boloKgAtual.precoKg * kg;
        var obs = (document.getElementById('bes-kg-obs') && document.getElementById('bes-kg-obs').value) || '';
        var el = document.getElementById('bes-kg-resumo');
        if (el) {
            el.innerHTML =
                '<div><strong>Sabor:</strong> ' +
                escapeHtml(boloKgAtual.nome) +
                '</div>' +
                '<div><strong>Peso:</strong> ' +
                kg +
                ' kg</div>' +
                '<div><strong>Valor por kg:</strong> ' +
                formatPreco(boloKgAtual.precoKg) +
                '</div>' +
                (obs.trim()
                    ? '<div><strong>Observações:</strong> ' + escapeHtml(obs.trim()) + '</div>'
                    : '') +
                '<div class="bes-resumo__total">Total: ' +
                formatPreco(total) +
                '</div>';
        }
        syncBesOpt(document.getElementById('bes-modal-kg'), '.bes-opt');
    }

    function abrirModalKg(id) {
        var b = acharEspecial(id);
        if (!b) return;
        boloKgAtual = b;
        var modal = document.getElementById('bes-modal-kg');
        var n = document.getElementById('bes-kg-nome');
        var d = document.getElementById('bes-kg-desc');
        var p = document.getElementById('bes-kg-preco-ref');
        if (n) n.textContent = b.nome;
        if (d) d.textContent = b.desc;
        if (p) p.textContent = formatPreco(b.precoKg) + ' / kg';
        var r1 = document.getElementById('bes-kg-1');
        if (r1) r1.checked = true;
        var obs = document.getElementById('bes-kg-obs');
        if (obs) obs.value = '';
        atualizarResumoKg();
        if (modal) {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
        modalKgAberto = true;
        var c = document.getElementById('bes-kg-close');
        if (c) c.focus();
    }

    function fecharModalKg() {
        var modal = document.getElementById('bes-modal-kg');
        if (modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
        if (!modalTacaAberto) document.body.style.overflow = '';
        modalKgAberto = false;
        boloKgAtual = null;
    }

    function addKgAoCarrinho() {
        if (!boloKgAtual || typeof window.adicionarCarrinho !== 'function') return;
        var kg = kgSelecionado();
        var obs = (document.getElementById('bes-kg-obs') && document.getElementById('bes-kg-obs').value.trim()) || '';
        var detalhes =
            'Peso: ' +
            kg +
            ' kg\nValor por kg: ' +
            formatPreco(boloKgAtual.precoKg) +
            '\nTotal: ' +
            formatPreco(boloKgAtual.precoKg * kg) +
            (obs ? '\nObservações: ' + obs : '');
        window.adicionarCarrinho('Bolo especial — ' + boloKgAtual.nome, boloKgAtual.precoKg, 1, {
            detalhes: detalhes,
            quantidadeInicial: kg,
            unidadePreco: '/ kg',
            hintQuantidade: 'Quantidade em quilos do bolo (mín. 1 kg).'
        });
        fecharModalKg();
    }

    function precoTacaSelecionado() {
        var el = document.querySelector('input[name="bes-taca-tipo"]:checked');
        return el && el.value === 'loja' ? 120 : 99;
    }

    function atualizarResumoTaca() {
        if (!boloTacaAtual) return;
        var tipo = document.querySelector('input[name="bes-taca-tipo"]:checked');
        var tipoLabel =
            tipo && tipo.value === 'loja' ? 'Taça fornecida pela loja (1250 ml)' : 'Cliente traz taça 1250 ml';
        var unit = precoTacaSelecionado();
        var qtyEl = document.getElementById('bes-taca-qty');
        var qty = qtyEl ? Math.max(1, parseInt(String(qtyEl.value), 10) || 1) : 1;
        if (qtyEl && String(qtyEl.value) !== String(qty)) qtyEl.value = qty;
        var obs = (document.getElementById('bes-taca-obs') && document.getElementById('bes-taca-obs').value) || '';
        var total = unit * qty;
        var el = document.getElementById('bes-taca-resumo');
        if (el) {
            el.innerHTML =
                '<div><strong>Sabor:</strong> ' +
                escapeHtml(boloTacaAtual.nome) +
                '</div>' +
                '<div><strong>Taça:</strong> ' +
                escapeHtml(tipoLabel) +
                '</div>' +
                '<div><strong>Quantidade:</strong> ' +
                qty +
                '</div>' +
                '<div><strong>Valor unitário:</strong> ' +
                formatPreco(unit) +
                '</div>' +
                (obs.trim()
                    ? '<div><strong>Observações:</strong> ' + escapeHtml(obs.trim()) + '</div>'
                    : '') +
                '<div class="bes-resumo__total">Total: ' +
                formatPreco(total) +
                '</div>';
        }
        syncBesOpt(document.getElementById('bes-modal-taca'), '.bes-opt');
    }

    function abrirModalTaca(id) {
        var t = acharTaca(id);
        if (!t) return;
        boloTacaAtual = t;
        var modal = document.getElementById('bes-modal-taca');
        var n = document.getElementById('bes-taca-nome');
        var d = document.getElementById('bes-taca-desc');
        if (n) n.textContent = t.nome;
        if (d) d.textContent = t.desc;
        var rC = document.getElementById('bes-taca-cliente');
        if (rC) rC.checked = true;
        var qty = document.getElementById('bes-taca-qty');
        if (qty) qty.value = '1';
        var obs = document.getElementById('bes-taca-obs');
        if (obs) obs.value = '';
        atualizarResumoTaca();
        if (modal) {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
        modalTacaAberto = true;
        var c = document.getElementById('bes-taca-close');
        if (c) c.focus();
    }

    function fecharModalTaca() {
        var modal = document.getElementById('bes-modal-taca');
        if (modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
        if (!modalKgAberto) document.body.style.overflow = '';
        modalTacaAberto = false;
        boloTacaAtual = null;
    }

    function addTacaAoCarrinho() {
        if (!boloTacaAtual || typeof window.adicionarCarrinho !== 'function') return;
        var unit = precoTacaSelecionado();
        var qtyEl = document.getElementById('bes-taca-qty');
        var qty = qtyEl ? Math.max(1, parseInt(String(qtyEl.value), 10) || 1) : 1;
        var tipo = document.querySelector('input[name="bes-taca-tipo"]:checked');
        var tipoLabel =
            tipo && tipo.value === 'loja' ? 'Taça fornecida pela loja (1250 ml)' : 'Cliente traz taça 1250 ml';
        var obs = (document.getElementById('bes-taca-obs') && document.getElementById('bes-taca-obs').value.trim()) || '';
        var detalhes =
            tipoLabel +
            '\nValor unitário: ' +
            formatPreco(unit) +
            '\nQuantidade: ' +
            qty +
            '\nTotal: ' +
            formatPreco(unit * qty) +
            (obs ? '\nObservações: ' + obs : '');
        window.adicionarCarrinho('Bolo na taça — ' + boloTacaAtual.nome, unit, 1, {
            detalhes: detalhes,
            quantidadeInicial: qty,
            unidadePreco: 'p/ taça',
            hintQuantidade: 'Quantidade de taças (mín. 1).'
        });
        fecharModalTaca();
    }

    function initModaisKg() {
        var modal = document.getElementById('bes-modal-kg');
        if (!modal) return;
        document.getElementById('bes-kg-close').addEventListener('click', fecharModalKg);
        modal.querySelector('.bes-modal__backdrop').addEventListener('click', fecharModalKg);
        document.getElementById('bes-kg-add').addEventListener('click', addKgAoCarrinho);
        modal.querySelectorAll('input[name="bes-kg-peso"]').forEach(function (inp) {
            inp.addEventListener('change', atualizarResumoKg);
        });
        var obs = document.getElementById('bes-kg-obs');
        if (obs) obs.addEventListener('input', atualizarResumoKg);
    }

    function initModaisTaca() {
        var modal = document.getElementById('bes-modal-taca');
        if (!modal) return;
        document.getElementById('bes-taca-close').addEventListener('click', fecharModalTaca);
        modal.querySelector('.bes-modal__backdrop').addEventListener('click', fecharModalTaca);
        document.getElementById('bes-taca-add').addEventListener('click', addTacaAoCarrinho);
        modal.querySelectorAll('input[name="bes-taca-tipo"]').forEach(function (inp) {
            inp.addEventListener('change', atualizarResumoTaca);
        });
        var qty = document.getElementById('bes-taca-qty');
        if (qty) {
            qty.addEventListener('input', atualizarResumoTaca);
            qty.addEventListener('change', atualizarResumoTaca);
        }
        var obs = document.getElementById('bes-taca-obs');
        if (obs) obs.addEventListener('input', atualizarResumoTaca);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (modalKgAberto) fecharModalKg();
        if (modalTacaAberto) fecharModalTaca();
    });

    function init() {
        if (!document.body.classList.contains('pagina-bolos-especiais')) return;
        if (!document.getElementById('bes-grid-especiais')) return;
        renderGrids();
        initModaisKg();
        initModaisTaca();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
