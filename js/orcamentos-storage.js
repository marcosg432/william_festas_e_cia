/**
 * Orçamentos: API SQLite (servidor local) com fallback em localStorage.
 * Chaves: "orcamentos" e orcamentos_<empresa> (legado).
 */

var ORCAMENTOS_LS_KEY = "orcamentos";

function getLegacyOrcamentosKey() {
    var nome = typeof getConfigStorageSlug === "function"
        ? getConfigStorageSlug()
        : ((typeof CONFIG !== "undefined" && CONFIG.nomeEmpresa)
            ? CONFIG.nomeEmpresa.replace(/\s+/g, "_").toLowerCase()
            : "default");
    return "orcamentos_" + nome;
}

function parseListaOrcamentosRaw(raw) {
    if (!raw) return [];
    try {
        var arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        return [];
    }
}

function mergeListasOrcamentosPorId(listas) {
    var byId = {};
    for (var L = 0; L < listas.length; L++) {
        var arr = listas[L];
        if (!Array.isArray(arr)) continue;
        for (var i = 0; i < arr.length; i++) {
            var o = arr[i];
            if (!o || o.id == null) continue;
            var k = String(o.id);
            var cur = byId[k];
            if (!cur) {
                byId[k] = o;
            } else {
                var t1 = Date.parse(cur.data_criacao || cur.data || 0) || 0;
                var t2 = Date.parse(o.data_criacao || o.data || 0) || 0;
                if (t2 >= t1) byId[k] = o;
            }
        }
    }
    var ids = Object.keys(byId).sort(function (a, b) {
        return Number(b) - Number(a);
    });
    return ids.map(function (id) {
        return byId[id];
    });
}

function apiRequestSync(method, pathStr, bodyObj) {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open(method, pathStr, false);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        if (bodyObj != null) {
            xhr.send(JSON.stringify(bodyObj));
        } else {
            xhr.send(null);
        }
        return {
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            body: xhr.responseText || ""
        };
    } catch (e) {
        return { ok: false, status: 0, body: "" };
    }
}

function obterOrcamentosSoLocalStorage() {
    var a1 = parseListaOrcamentosRaw(localStorage.getItem(ORCAMENTOS_LS_KEY));
    var a2 = parseListaOrcamentosRaw(localStorage.getItem(getLegacyOrcamentosKey()));
    return mergeListasOrcamentosPorId([a1, a2]);
}

function listarOrcamentos() {
    try {
        var r = apiRequestSync("GET", "/api/orcamentos", null);
        if (r.ok && r.body) {
            var sync = JSON.parse(r.body);
            if (Array.isArray(sync)) {
                try {
                    var json = JSON.stringify(sync);
                    localStorage.setItem(ORCAMENTOS_LS_KEY, json);
                    localStorage.setItem(getLegacyOrcamentosKey(), json);
                } catch (e) {
                    console.warn("Espelho local dos orçamentos:", e);
                }
                return sync;
            }
        }
    } catch (e) {
        console.warn("API indisponível, usando localStorage:", e);
    }
    try {
        var merged = obterOrcamentosSoLocalStorage();
        if (merged.length > 0) {
            try {
                var j = JSON.stringify(merged);
                localStorage.setItem(ORCAMENTOS_LS_KEY, j);
                localStorage.setItem(getLegacyOrcamentosKey(), j);
            } catch (syncErr) {
                console.warn("Ao unificar chaves de orçamentos:", syncErr);
            }
        }
        return merged;
    } catch (e2) {
        console.warn("Erro ao listar orçamentos:", e2);
        return [];
    }
}

function salvarListaOrcamentos(arr) {
    try {
        var json = JSON.stringify(arr);
        localStorage.setItem(ORCAMENTOS_LS_KEY, json);
        localStorage.setItem(getLegacyOrcamentosKey(), json);
    } catch (e) {
        console.warn("LocalStorage:", e);
        throw e;
    }
}

function getOrcamentoPorId(id) {
    return listarOrcamentos().find(function (o) {
        return String(o.id) === String(id);
    });
}

function mesclaListaComOrcamento(lista, registro) {
    var out = lista.slice();
    var i = out.findIndex(function (o) {
        return String(o.id) === String(registro.id);
    });
    if (i >= 0) out.splice(i, 1);
    out.unshift(registro);
    return out;
}

function criarOrcamento(registro) {
    try {
        var r = apiRequestSync("POST", "/api/orcamentos", registro);
        if (r.ok && r.body) {
            var saved = JSON.parse(r.body);
            var list = mesclaListaComOrcamento(obterOrcamentosSoLocalStorage(), saved);
            salvarListaOrcamentos(list);
            return saved;
        }
    } catch (e) {
        console.warn("POST orçamento — fallback local:", e);
    }
    var list = obterOrcamentosSoLocalStorage();
    list.unshift(registro);
    salvarListaOrcamentos(list);
    return registro;
}

function atualizarOrcamentoParcial(id, patch) {
    try {
        var r = apiRequestSync("PATCH", "/api/orcamentos/" + encodeURIComponent(id), patch);
        if (r.ok && r.body) {
            var saved = JSON.parse(r.body);
            var list = obterOrcamentosSoLocalStorage();
            var i = list.findIndex(function (o) {
                return String(o.id) === String(id);
            });
            if (i >= 0) list[i] = saved;
            else list.unshift(saved);
            salvarListaOrcamentos(list);
            return saved;
        }
    } catch (e) {
        console.warn("PATCH orçamento — fallback local:", e);
    }
    var list = obterOrcamentosSoLocalStorage();
    var i = list.findIndex(function (o) {
        return String(o.id) === String(id);
    });
    if (i === -1) return null;
    list[i] = Object.assign({}, list[i], patch);
    salvarListaOrcamentos(list);
    return list[i];
}
