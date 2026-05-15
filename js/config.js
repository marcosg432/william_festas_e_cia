/**
 * Configurações do Sistema de Pedidos / Orçamentos
 * Alterar apenas este arquivo para configurar em novos cardápios/clientes
 */
const CONFIG = {
    /** WhatsApp: Brasil + DDD + celular, só dígitos (ex.: (16) 99128-0505 → 5516991280505) */
    telefoneWhatsApp: "5516991280505",
    /**
     * Slug estável para chaves de localStorage/sessão (carrinho, orçamentos legado, admin).
     * Não altere após deploy se quiser manter dados já gravados no navegador.
     */
    storageId: "senna_doce",
    /** Nome da confeitaria exibido no site, PDFs, WhatsApp e admin */
    nomeEmpresa: "Willian Festas e Cia",
    /**
     * Pedido mínimo em unidades por produto e por sabor (orçamento / cardápio).
     * Padrão quando o card não define `data-produto-qtd-min`; se o card define (ex.: kits), vale o valor do card (mínimo 1).
     */
    pedidoMinimoUnidades: 50,
    /** Senha da área administrativa (troque em produção) */
    senhaAdmin: "Willianfestas280426",
    /** Chaves de status (espelho do banco / fluxo) */
    STATUS_ORCAMENTO: {
        NOVO: "novo_orcamento",
        DEGUST_AGENDADA: "degustacao_agendada",
        DEGUST_REALIZADA: "degustacao_realizada",
        DESCONTO_APLICADO: "desconto_aplicado",
        CONTRATO_GERADO: "contrato_gerado",
        FECHADO: "fechado",
        PERDIDO: "perdido"
    },
    /** Rótulos para exibição */
    STATUS_LABELS: {
        novo_orcamento: "Novo orçamento",
        degustacao_agendada: "Degustação agendada",
        degustacao_realizada: "Degustação realizada",
        desconto_aplicado: "Desconto aplicado",
        contrato_gerado: "Contrato gerado",
        fechado: "Fechado",
        perdido: "Perdido"
    },
    /**
     * Dados da CONTRATADA no contrato de prestação de serviços (PDF admin).
     * Ajuste nome, CPF e endereço conforme documento da empresa.
     */
    contratadaLegal: {
        nome: "ALINE FERNANDA MANOEL",
        cpf: "334.444.138.82",
        endereco: "Rua Raul Dantas Darce, 171, Piracicaba / SP"
    },
    /** Texto exibido na cláusula de pagamento (PIX / comprovante) */
    contratoPixCnpj: "41.919.042/0001-08",
    contratoEmailsComprovante: "contato@willianfestasecia.com.br",
    /** Dias de validade exibidos no PDF do orçamento */
    validadeOrcamentoDias: 15,
    /**
     * Logo para PDF (opcional): caminho a partir da raiz do site, ex: "assets/logo.png"
     * Deixe vazio para não carregar imagem (usa só o nome da empresa).
     */
    logoOrcamentoRelPath: "assets/logo-willian-festas-e-cia.png"
};

/**
 * Slug usado nas chaves de armazenamento; usa storageId quando definido, senão deriva de nomeEmpresa.
 */
function getConfigStorageSlug() {
    if (typeof CONFIG === "undefined") return "default";
    var sid = CONFIG.storageId;
    if (sid != null && String(sid).trim() !== "") {
        return String(sid).trim().replace(/\s+/g, "_").toLowerCase();
    }
    return String(CONFIG.nomeEmpresa || "default").replace(/\s+/g, "_").toLowerCase();
}
