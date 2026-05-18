/**
 * pedido-personalizado.js — Bolos c/ Chantilly: cards por coleção, modal de massa e carrinho.
 */
(function () {
    'use strict';

    var modalAberto = false;

    /**
     * Ordem: Tradicionais → Frutados → Premium → Combinações especiais (catálogo sec. 6 e 7).
     * @type {{ id: string, nome: string, desc: string, branca: number, preta: number, grupo: 'tradicionais'|'frutados'|'premium'|'especiais' }[]}
     */
    var BOLOS = [
        { id: 'brigadeiro', nome: 'Brigadeiro', desc: 'O clássico de festa, cremoso e marcante.', branca: 68, preta: 70, grupo: 'tradicionais' },
        { id: 'brigadeiro-ninho', nome: 'Brigadeiro de ninho', desc: 'Brigadeiro com perfil de leite em pó tipo ninho.', branca: 68, preta: 70, grupo: 'tradicionais' },
        { id: 'prestigio', nome: 'Prestígio', desc: 'Coco e chocolate no estilo amado das festas.', branca: 68, preta: 70, grupo: 'tradicionais' },
        { id: 'doce-leite', nome: 'Doce de leite', desc: 'Cremoso e reconfortante, sabor tradicional.', branca: 66, preta: 68, grupo: 'tradicionais' },
        { id: 'mousse-ninho-morango', nome: 'Mousse de ninho c/ morango', desc: 'Clássica combinação festiva com morango.', branca: 68, preta: 70, grupo: 'frutados' },
        { id: 'mousse-ninho-abacaxi', nome: 'Mousse de ninho c/ abacaxi', desc: 'Frescor da fruta equilibrando a cremosidade do ninho.', branca: 66, preta: 68, grupo: 'frutados' },
        { id: 'brigadeiro-morango', nome: 'Brigadeiro c/ morango', desc: 'Brigadeiro cremoso com notas de morango.', branca: 72, preta: 75, grupo: 'frutados' },
        { id: 'brigadeiro-maracuja', nome: 'Brigadeiro e maracujá', desc: 'Brigadeiro com frescor marcante do maracujá.', branca: 75, preta: 78, grupo: 'frutados' },
        { id: 'prestigio-morango', nome: 'Prestígio c/ morango', desc: 'Prestígio com toque frutado de morango.', branca: 72, preta: 75, grupo: 'frutados' },
        { id: 'doce-leite-abacaxi', nome: 'Doce de leite c/ abacaxi', desc: 'Doce de leite com compota de abacaxi.', branca: 70, preta: 72, grupo: 'frutados' },
        { id: 'doce-leite-ameixa', nome: 'Doce de leite c/ ameixa', desc: 'Clássico casamento de sabores.', branca: 68, preta: 72, grupo: 'frutados' },
        { id: 'mousse-ninho-nutella', nome: 'Mousse de ninho e Nutella', desc: 'Encontro irresistível entre ninho e avelã.', branca: 88, preta: 90, grupo: 'premium' },
        {
            id: 'mousse-ninho-ganache',
            nome: 'Mousse de ninho mesclado c/ ganache amargo',
            desc: 'Mescla sofisticada com ganache de chocolate amargo.',
            branca: 70,
            preta: 73,
            grupo: 'premium'
        },
        { id: 'mousse-chocolate-brigadeiro', nome: 'Mousse de chocolate e brigadeiro', desc: 'Para quem ama chocolate em dobro.', branca: 74, preta: 77, grupo: 'premium' },
        { id: 'mousse-chocolate-morango', nome: 'Mousse de chocolate c/ morango', desc: 'Contraste entre o amargo do chocolate e o morango.', branca: 72, preta: 75, grupo: 'premium' },
        { id: 'brigadeiro-prestigio', nome: 'Brigadeiro e prestígio', desc: 'Chocolate e coco em equilíbrio.', branca: 70, preta: 73, grupo: 'premium' },
        { id: 'mousse-ninho', nome: 'Mousse de ninho', desc: 'Recheio leve e cremoso com sabor marcante de leite ninho.', branca: 62, preta: 65, grupo: 'especiais' },
        {
            id: 'mousse-ninho-choc-preto',
            nome: 'Mousse de ninho c/ chocolate preto picado',
            desc: 'Ninho cremoso com crocância de chocolate meio amargo.',
            branca: 64,
            preta: 66,
            grupo: 'especiais'
        },
        {
            id: 'mousse-ninho-choc-branco',
            nome: 'Mousse de ninho c/ chocolate branco picado',
            desc: 'Contraste suave entre ninho e chocolate branco em pedaços.',
            branca: 66,
            preta: 69,
            grupo: 'especiais'
        },
        { id: 'mousse-ninho-brigadeiro', nome: 'Mousse de ninho e brigadeiro', desc: 'Dupla de sabores brasileiros em camadas harmoniosas.', branca: 70, preta: 72, grupo: 'especiais' },
        { id: 'mousse-ninho-mousse-choco', nome: 'Mousse de ninho e mousse de chocolate', desc: 'Duas mousses clássicas em equilíbrio.', branca: 72, preta: 75, grupo: 'especiais' },
        { id: 'mousse-chocolate', nome: 'Mousse de chocolate', desc: 'Intenso em cacau, textura aerada e elegante.', branca: 70, preta: 73, grupo: 'especiais' },
        { id: 'brigadeiro-ninho-morango', nome: 'Brigadeiro de ninho c/ morango', desc: 'Ninho cremoso com morango.', branca: 72, preta: 75, grupo: 'especiais' }
    ];

    var boloModal = null;

    function $(sel, root) {
        return (root || document).querySelector(sel);
    }

    function formatPreco(n) {
        return 'R$ ' + n + ',00';
    }

    function escapeHtml(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function precoAtual(b, massa) {
        return massa === 'preta' ? b.preta : b.branca;
    }

    function renderCatalogo() {
        var roots = {
            tradicionais: document.getElementById('bc-grid-tradicionais'),
            frutados: document.getElementById('bc-grid-frutados'),
            premium: document.getElementById('bc-grid-premium'),
            especiais: document.getElementById('bc-grid-especiais')
        };
        for (var g in roots) {
            if (!roots[g]) continue;
            roots[g].innerHTML = '';
        }
        for (var i = 0; i < BOLOS.length; i++) {
            var b = BOLOS[i];
            var root = roots[b.grupo];
            if (!root) continue;
            var art = document.createElement('article');
            art.className = 'bc-card';
            art.setAttribute('data-bc-id', b.id);
            art.innerHTML =
                '<div class="bc-card__media bc-card__media--em-breve" aria-hidden="true">' +
                '<span class="bc-card__em-breve">Em breve</span>' +
                '<span class="bc-card__em-breve-sub">Foto do sabor</span>' +
                '</div>' +
                '<div class="bc-card__body">' +
                '<h3 class="bc-card__title">' +
                escapeHtml(b.nome) +
                '</h3>' +
                '<p class="bc-card__desc">' +
                escapeHtml(b.desc) +
                '</p>' +
                '<ul class="bc-card__precos">' +
                '<li>Massa branca — ' +
                formatPreco(b.branca) +
                '</li>' +
                '<li>Massa preta — ' +
                formatPreco(b.preta) +
                '</li>' +
                '</ul>' +
                '<button type="button" class="bc-card__btn">Montar bolo</button>' +
                '</div>';
            art.querySelector('.bc-card__btn').addEventListener('click', function (ev) {
                var card = ev.target.closest('.bc-card');
                if (!card) return;
                var id = card.getAttribute('data-bc-id');
                abrirModalPorId(id);
            });
            root.appendChild(art);
        }
    }

    function acharBolo(id) {
        for (var j = 0; j < BOLOS.length; j++) {
            if (BOLOS[j].id === id) return BOLOS[j];
        }
        return null;
    }

    function syncMassaClasses() {
        document.querySelectorAll('.bc-massa-opt').forEach(function (lab) {
            var inp = lab.querySelector('input[type="radio"]');
            lab.classList.toggle('is-selected', inp && inp.checked);
        });
    }

    function atualizarResumoModal() {
        if (!boloModal) return;
        var massa = $('input[name="bc-massa"]:checked');
        var m = massa ? massa.value : 'branca';
        var preco = precoAtual(boloModal, m);
        var massaLabel = m === 'preta' ? 'Preta' : 'Branca';
        var elSabor = document.getElementById('bc-modal-resumo-sabor');
        var elMassa = document.getElementById('bc-modal-resumo-massa');
        var elPreco = document.getElementById('bc-modal-resumo-preco');
        if (elSabor) elSabor.textContent = boloModal.nome;
        if (elMassa) elMassa.textContent = massaLabel;
        if (elPreco) elPreco.textContent = formatPreco(preco);
        syncMassaClasses();
    }

    function abrirModalPorId(id) {
        var b = acharBolo(id);
        if (!b) return;
        boloModal = b;
        var modal = document.getElementById('bc-modal');
        var titulo = document.getElementById('bc-modal-sabor');
        if (titulo) titulo.textContent = b.nome;
        var rBranca = document.getElementById('bc-massa-branca');
        var rPreta = document.getElementById('bc-massa-preta');
        if (rBranca) {
            rBranca.checked = true;
            rBranca.value = 'branca';
        }
        if (rPreta) rPreta.value = 'preta';
        var lBranca = document.getElementById('bc-label-massa-branca');
        var lPreta = document.getElementById('bc-label-massa-preta');
        if (lBranca) {
            var spB = lBranca.querySelector('.bc-massa-opt__preco');
            if (spB) spB.textContent = formatPreco(b.branca);
        }
        if (lPreta) {
            var spP = lPreta.querySelector('.bc-massa-opt__preco');
            if (spP) spP.textContent = formatPreco(b.preta);
        }
        atualizarResumoModal();
        if (modal) {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
        modalAberto = true;
        var closeBtn = document.getElementById('bc-modal-close');
        if (closeBtn) closeBtn.focus();
    }

    function fecharModal() {
        var modal = document.getElementById('bc-modal');
        if (modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
        document.body.style.overflow = '';
        modalAberto = false;
        boloModal = null;
    }

    function addAoCarrinho() {
        if (!boloModal || typeof window.adicionarCarrinho !== 'function') return;
        var massaEl = $('input[name="bc-massa"]:checked');
        var massa = massaEl ? massaEl.value : 'branca';
        var massaLabel = massa === 'preta' ? 'Preta' : 'Branca';
        var preco = precoAtual(boloModal, massa);
        var nome = 'Bolo c/ Chantilly — ' + boloModal.nome;
        var detalhes =
            'Sabor: ' +
            boloModal.nome +
            '\nMassa: ' +
            massaLabel +
            '\nPreço: ' +
            formatPreco(preco);
        window.adicionarCarrinho(nome, preco, 1, { detalhes: detalhes });
        fecharModal();
    }

    function initModal() {
        var modal = document.getElementById('bc-modal');
        if (!modal) return;
        document.getElementById('bc-modal-close').addEventListener('click', fecharModal);
        modal.querySelector('.bc-modal__backdrop').addEventListener('click', fecharModal);
        document.getElementById('bc-modal-add').addEventListener('click', addAoCarrinho);
        modal.querySelectorAll('input[name="bc-massa"]').forEach(function (inp) {
            inp.addEventListener('change', atualizarResumoModal);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modalAberto) fecharModal();
        });
    }

    function init() {
        if (!document.body.classList.contains('pagina-bolos')) return;
        if (!document.getElementById('bc-grid-especiais')) return;
        renderCatalogo();
        initModal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
