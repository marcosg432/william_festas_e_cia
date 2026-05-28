/**
 * pedido.js — Geração de orçamento (carrinho + dados do evento) e aviso por WhatsApp
 * Ordem: montar objeto → salvar em localStorage ("orcamentos") → WhatsApp → limpar carrinho → UI
 */

function qtdMinDoItemCarrinho(item) {
    if (typeof resolverQtdMin === 'function') {
        return resolverQtdMin(item && item.qtdMin != null ? item.qtdMin : null);
    }
    var padrao = 50;
    if (typeof CONFIG !== 'undefined' && CONFIG.pedidoMinimoUnidades != null) {
        var p = parseInt(String(CONFIG.pedidoMinimoUnidades), 10);
        if (Number.isFinite(p) && p >= 1) padrao = p;
    }
    var m = parseInt(item && item.qtdMin != null ? item.qtdMin : padrao, 10);
    if (!Number.isFinite(m) || m < 1) return padrao;
    return Math.max(padrao, m);
}

function validarQuantidadesCarrinho() {
    for (var i = 0; i < carrinho.length; i++) {
        var item = carrinho[i];
        if (!item) continue;
        var min = qtdMinDoItemCarrinho(item);
        var q = parseInt(String(item.quantidade), 10);
        if (!Number.isFinite(q) || q < min) {
            return "A quantidade de \"" + String(item.nome || "").replace(/"/g, "'") + "\" deve ser no mínimo " + min + " unidade(s). Ajuste no carrinho e tente novamente.";
        }
    }
    return null;
}

function montarItensOrcamentoDoCarrinho() {
    return carrinho.map(function (item) {
        var subtotal = Math.round(item.preco * item.quantidade * 100) / 100;
        var min = qtdMinDoItemCarrinho(item);
        var o = {
            nome: item.nome,
            quantidade: item.quantidade,
            preco: item.preco,
            preco_unitario: item.preco,
            subtotal: subtotal,
            qtd_min: min
        };
        if (item.detalhes) o.detalhes = item.detalhes;
        return o;
    });
}

function campoTrimOrcamento(id) {
    var el = document.getElementById(id);
    if (!el || el.value == null) return "";
    return String(el.value).trim();
}

function formatarDataMensagemOrcamento(dataIso) {
    if (!dataIso) return "-";
    var partes = String(dataIso).split("-");
    if (partes.length !== 3) return dataIso;
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function limparTextoMensagemOrcamento(txt) {
    return String(txt || "")
        .replace(/\s+/g, " ")
        .replace(/\bbem\s*casados?\b/gi, "")
        .trim();
}

function parseLinhaDetalheItemOrcamento(texto) {
    var raw = limparTextoMensagemOrcamento(texto);
    if (!raw) return null;
    var match = raw.match(/^(\d+)\s+(.+?)\s+\((?:R\$\s*[\d.,]+\s*\/un\s*=\s*)?R\$\s*([\d.,]+)\)$/i);
    if (!match) return null;
    var qtd = parseInt(match[1], 10);
    var nome = limparTextoMensagemOrcamento(match[2]) || "Item personalizado";
    var subtotal = parseFloat(String(match[3]).replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(qtd) || qtd < 1 || !nome || !Number.isFinite(subtotal)) return null;
    return {
        quantidade: qtd,
        nome: nome,
        subtotal: Math.round(subtotal * 100) / 100
    };
}

function linhasMensagemItensOrcamento() {
    var linhas = [];
    var unidades = 0;
    carrinho.forEach(function (item) {
        if (!item) return;
        var detalhes = String(item.detalhes || "");
        var partes = detalhes ? detalhes.split("|") : [];
        var encontrouDetalhesEstruturados = false;
        for (var i = 0; i < partes.length; i++) {
            var parsed = parseLinhaDetalheItemOrcamento(partes[i]);
            if (!parsed) continue;
            encontrouDetalhesEstruturados = true;
            unidades += parsed.quantidade;
            linhas.push("• " + parsed.quantidade + " " + parsed.nome + " — R$ " + formatarPreco(parsed.subtotal));
        }
        if (encontrouDetalhesEstruturados) return;

        var qtd = parseInt(String(item.quantidade), 10);
        if (!Number.isFinite(qtd) || qtd < 1) qtd = 1;
        var nome = limparTextoMensagemOrcamento(item.nome) || "Item personalizado";
        var subtotal = Math.round((Number(item.preco) || 0) * qtd * 100) / 100;
        unidades += qtd;
        linhas.push("• " + qtd + " " + nome + " — R$ " + formatarPreco(subtotal));
        if (detalhes) {
            linhas.push("  " + limparTextoMensagemOrcamento(detalhes));
        }
    });
    return { linhas: linhas, unidades: unidades };
}

function montarMensagemOrcamento(orcId) {
    var nome = campoTrimOrcamento("nome");
    var telefone = campoTrimOrcamento("telefone");
    var email = campoTrimOrcamento("email-cliente");
    var cpf = campoTrimOrcamento("cpf-cliente");
    var rg = campoTrimOrcamento("rg-cliente");
    var dataEvento = campoTrimOrcamento("data-evento");
    var tipoEvento = campoTrimOrcamento("tipo-evento");
    var convidados = campoTrimOrcamento("convidados");
    var localEvento = campoTrimOrcamento("local-evento");
    var tipo = campoTrimOrcamento("tipo");
    var endereco = campoTrimOrcamento("endereco");
    var horarioRetirada = campoTrimOrcamento("horario-retirada");
    var pagamento = campoTrimOrcamento("pagamento");
    var observacao = campoTrimOrcamento("observacao");

    var valorOriginal = Math.round(calcularTotal() * 100) / 100;
    var resumoItens = linhasMensagemItensOrcamento();

    var msg = "Olá, vim pelo cardápio e gostaria de fazer um pedido.\n\n";
    msg += "NOVO ORÇAMENTO\n";
    msg += "Ref: " + orcId + "\n\n";
    msg += "Pedido mínimo: 25 unidades por sabor.\n\n";
    msg += "ITENS DO PEDIDO:\n";
    msg += resumoItens.linhas.length ? resumoItens.linhas.join("\n") + "\n\n" : "• Itens a confirmar\n\n";
    msg += "Total:\n";
    msg += resumoItens.unidades + " unidades — R$ " + formatarPreco(valorOriginal) + "\n\n";
    msg += "EVENTO:\n";
    msg += "Data: " + formatarDataMensagemOrcamento(dataEvento) + "\n";
    if (tipoEvento) msg += "Ocasião: " + limparTextoMensagemOrcamento(tipoEvento) + "\n";
    if (convidados) msg += "Convidados: " + convidados + "\n";
    if (localEvento) msg += "Local: " + limparTextoMensagemOrcamento(localEvento) + "\n";
    msg += "\nTipo do pedido:\n";
    msg += (tipo || "-") + "\n";
    if (tipo === "Retirada") {
        msg += "\nHorário da retirada:\n";
        msg += (horarioRetirada || "-") + "\n";
    }
    if (tipo === "Entrega") msg += "Endereço: " + (endereco || "-") + "\n";
    if (pagamento) msg += "\nPagamento:\n" + limparTextoMensagemOrcamento(pagamento) + "\n";
    if (observacao) msg += "\nObservações:\n" + limparTextoMensagemOrcamento(observacao) + "\n";
    msg += "\nCLIENTE:\n";
    msg += "Nome: " + (nome || "-") + "\n";
    msg += "Telefone: " + (telefone || "-") + "\n";
    if (email) msg += "E-mail: " + email + "\n";
    if (cpf) msg += "CPF: " + cpf + "\n";
    if (rg) msg += "RG: " + rg + "\n";
    return msg;
}

function validarFormularioOrcamento() {
    var nome = campoTrimOrcamento("nome");
    var telefone = campoTrimOrcamento("telefone");
    var email = campoTrimOrcamento("email-cliente");
    var dataEvento = campoTrimOrcamento("data-evento");
    var tipoEvento = campoTrimOrcamento("tipo-evento");
    var convidados = campoTrimOrcamento("convidados");
    var localEvento = campoTrimOrcamento("local-evento");
    var tipo = campoTrimOrcamento("tipo");
    var endereco = campoTrimOrcamento("endereco");
    var horarioRetirada = campoTrimOrcamento("horario-retirada");

    if (!nome) return "Preencha o nome do cliente.";
    if (!telefone) return "Preencha o telefone.";
    if (!email) return "Preencha o e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido.";
    if (!dataEvento) return "Informe a data do evento.";
    if (!tipoEvento) return "Informe o tipo de evento.";
    if (!convidados || parseInt(convidados, 10) < 1) return "Informe o número de convidados.";
    if (!localEvento) return "Informe o local do evento.";
    if (!tipo) return "Selecione o tipo do pedido.";
    if (tipo === "Entrega" && !endereco) return "Preencha o endereço para entrega.";
    if (tipo === "Retirada" && !horarioRetirada) return "Informe o horário de retirada.";

    return null;
}

function gerarOrcamento() {
    if (carrinho.length === 0) {
        alert("Adicione itens ao orçamento antes de gerar.");
        return;
    }

    var errQtd = validarQuantidadesCarrinho();
    if (errQtd) {
        alert(errQtd);
        return;
    }

    var erro = validarFormularioOrcamento();
    if (erro) {
        alert(erro);
        return;
    }

    var nome = campoTrimOrcamento("nome");
    var telefone = campoTrimOrcamento("telefone");
    var email = campoTrimOrcamento("email-cliente");
    var cpf = campoTrimOrcamento("cpf-cliente");
    var rg = campoTrimOrcamento("rg-cliente");
    var dataEvento = campoTrimOrcamento("data-evento");
    var tipoEvento = campoTrimOrcamento("tipo-evento");
    var convidados = campoTrimOrcamento("convidados");
    var localEvento = campoTrimOrcamento("local-evento");
    var tipo = campoTrimOrcamento("tipo");
    var endereco = campoTrimOrcamento("endereco");
    var horarioRetirada = campoTrimOrcamento("horario-retirada");
    var pagamento = campoTrimOrcamento("pagamento");
    var observacao = campoTrimOrcamento("observacao");

    var entregaTexto = tipo === "Entrega"
        ? "Entrega — " + (endereco || "")
        : (tipo === "Retirada" && horarioRetirada ? "Retirada — " + horarioRetirada : (tipo || ""));

    var valorOriginal = Math.round(calcularTotal() * 100) / 100;
    var id = Date.now();
    var itens = montarItensOrcamentoDoCarrinho();

    var statusNovo = (CONFIG && CONFIG.STATUS_ORCAMENTO && CONFIG.STATUS_ORCAMENTO.NOVO) || "novo_orcamento";
    var agora = new Date().toISOString();

    var registro = {
        id: id,
        cliente: nome,
        telefone: telefone,
        email: email,
        evento_data: dataEvento,
        evento_tipo: tipoEvento,
        convidados: parseInt(convidados, 10) || 0,
        local: localEvento,
        entrega: entregaTexto,
        observacoes: observacao || "",
        itens: itens,
        valor_original: valorOriginal,
        desconto_tipo: null,
        desconto_valor: null,
        valor_desconto: 0,
        desconto_degustacao: null,
        desconto_cerimonialista: null,
        taxa_entrega: null,
        valor_final: valorOriginal,
        degustacao_data: null,
        degustacao_hora: null,
        degustacao_obs: null,
        forma_pagamento: pagamento || "",
        entrada: null,
        restante: null,
        data_pagamento_entrada: null,
        data_pagamento_final: null,
        status: statusNovo,
        contrato_pdf: null,
        data_criacao: agora,
        nome_cliente: nome,
        data_evento: dataEvento,
        tipo_evento: tipoEvento,
        local_evento: localEvento,
        entrega_retirada: tipo,
        endereco: tipo === "Entrega" ? endereco : null,
        horario_retirada: tipo === "Retirada" ? horarioRetirada : null,
        forma_pagamento_ref: pagamento || null,
        pagamento: pagamento || "",
        total: valorOriginal,
        cliente_cpf: cpf ? cpf : null,
        cliente_rg: rg ? rg : null,
        rg: rg ? rg : null,
        cpf: cpf ? cpf : null,
        data: agora,
        contrato: null
    };

    try {
        if (typeof criarOrcamento !== "function") {
            throw new Error("criarOrcamento não disponível (orcamentos-storage.js).");
        }
        criarOrcamento(registro);
    } catch (e) {
        console.error(e);
        alert("Não foi possível salvar o orçamento. Verifique o armazenamento do navegador ou bloqueios.");
        return;
    }

    var telefoneWa = (typeof CONFIG !== "undefined" && CONFIG.telefoneWhatsApp) ? CONFIG.telefoneWhatsApp : "5516991280505";
    var mensagem = montarMensagemOrcamento(String(id));
    var url = "https://wa.me/" + telefoneWa + "?text=" + encodeURIComponent(mensagem);
    window.open(url, "_blank");

    alert("Orçamento salvo (ref. " + id + "). Abrindo o WhatsApp…");

    carrinho = [];
    salvarCarrinho(carrinho);
    atualizarCarrinho();
    atualizarBadge();
    fecharCarrinho();
}

function toggleCampoEndereco() {
    var tipo = document.getElementById("tipo");
    var enderecoWrap = document.getElementById("endereco-wrap");
    var enderecoInput = document.getElementById("endereco");
    var horarioWrap = document.getElementById("retirada-horario-wrap");
    var horarioInput = document.getElementById("horario-retirada");

    if (tipo && enderecoWrap) {
        if (tipo.value === "Entrega") {
            enderecoWrap.style.display = "block";
            if (enderecoInput) enderecoInput.required = true;
        } else {
            enderecoWrap.style.display = "none";
            if (enderecoInput) {
                enderecoInput.required = false;
                enderecoInput.value = "";
            }
        }
    }

    if (tipo && horarioWrap) {
        if (tipo.value === "Retirada") {
            horarioWrap.style.display = "block";
            if (horarioInput) horarioInput.required = true;
        } else {
            horarioWrap.style.display = "none";
            if (horarioInput) {
                horarioInput.required = false;
                horarioInput.value = "";
            }
        }
    }
}

function initPedido() {
    var btnFinalizar = document.querySelector(".carrinho-sidebar .btn-finalizar-pedido");
    var tipoSelect = document.getElementById("tipo");

    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", gerarOrcamento);
    }

    if (tipoSelect) {
        tipoSelect.addEventListener("change", toggleCampoEndereco);
        toggleCampoEndereco();
    }
}

document.addEventListener("DOMContentLoaded", initPedido);
