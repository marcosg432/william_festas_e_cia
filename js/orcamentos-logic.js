/**
 * Cálculo de valor final e desconto (preços dos produtos não são alterados)
 */

function calcularValorFinalComDesconto(valorOriginal, descontoTipo, descontoValor) {
    const vo = Math.max(0, Number(valorOriginal) || 0);
    const tipo = descontoTipo;
    const dv = Number(descontoValor);
    if (!tipo || dv == null || isNaN(dv) || dv <= 0) return Math.round(vo * 100) / 100;

    if (tipo === 'reais') {
        return Math.round(Math.max(0, vo - dv) * 100) / 100;
    }
    if (tipo === 'percentual') {
        const p = Math.min(100, Math.max(0, dv));
        return Math.round(vo * (1 - p / 100) * 100) / 100;
    }
    return vo;
}

function descontoEquivalenteEmReais(valorOriginal, descontoTipo, descontoValor) {
    const vo = Math.max(0, Number(valorOriginal) || 0);
    const vf = calcularValorFinalComDesconto(vo, descontoTipo, descontoValor);
    return Math.round((vo - vf) * 100) / 100;
}

/**
 * Valor numérico opcional (vazio → 0), nunca negativo.
 */
function valorMonetarioOrcamentoOpcional(v) {
    if (v == null || v === "") return 0;
    var n = Number(String(v).replace(",", "."));
    if (isNaN(n) || n < 0) return 0;
    return Math.round(n * 100) / 100;
}

/**
 * valorFinal = subtotal − descontoGeral − descontoDegustação − descontoCerimonialista + taxaEntrega
 * (descontoGeral = efeito em R$ do desconto principal % ou fixo sobre o subtotal; taxa soma ao final)
 */
function calcularValorFinalOrcamento(vo, descontoTipo, descontoValor, descontoDegustacao, descontoCerimonialista, taxaEntrega) {
    var subtotal = Math.max(0, Number(vo) || 0);
    var dg = descontoTipo ? descontoEquivalenteEmReais(subtotal, descontoTipo, descontoValor) : 0;
    var dd = valorMonetarioOrcamentoOpcional(descontoDegustacao);
    var dc = valorMonetarioOrcamentoOpcional(descontoCerimonialista);
    var te = valorMonetarioOrcamentoOpcional(taxaEntrega);
    var vf = subtotal - dg - dd - dc + te;
    return Math.round(Math.max(0, vf) * 100) / 100;
}

/** valorRestante = max(0, valorFinal − entrada); entrada vazia trata como 0 */
function calcularValorRestanteOrcamento(valorFinal, entrada) {
    var vf = Math.max(0, Number(valorFinal) || 0);
    var ent = entrada == null || entrada === "" ? 0 : valorMonetarioOrcamentoOpcional(entrada);
    var rest = vf - ent;
    return Math.round(Math.max(0, rest) * 100) / 100;
}
