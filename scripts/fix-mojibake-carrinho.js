/**
 * Substitui títulos do carrinho corrompidos (UTF-8 lido como Latin-1 / mojibake) por texto correto.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const REPLACEMENTS = [
    ["Sua celebra\u00c3\u00a7\u00c3\u00a3o", "Sua celebração"],
    ["Data da celebra\u00c3\u00a7\u00c3\u00a3o *", "Data da celebração *"],
    ["Ocasi\u00c3\u00a3o *", "Ocasião *"]
];

function walk(dir) {
    const names = fs.readdirSync(dir, { withFileTypes: true });
    for (const n of names) {
        const p = path.join(dir, n.name);
        if (n.isDirectory()) {
            if (n.name === "node_modules" || n.name === ".git") continue;
            walk(p);
            continue;
        }
        if (!n.name.endsWith(".html")) continue;
        let t = fs.readFileSync(p, "utf8");
        const original = t;
        for (const [bad, good] of REPLACEMENTS) {
            t = t.split(bad).join(good);
        }
        if (t !== original) {
            fs.writeFileSync(p, t, "utf8");
            console.log("Corrigido:", path.relative(root, p));
        }
    }
}

walk(root);
