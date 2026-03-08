# Deploy - Senna Doces & Salgados (Hostinger)

**Porta usada: 3003** (não interfere em 22, 80, 3000, 3001, 3002, 53)

## Comandos para executar na Hostinger

### 1. Instalar Node.js (se não tiver)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Instalar PM2
```bash
sudo npm install -g pm2
```

### 3. Clonar o repositório
```bash
cd ~
git clone https://github.com/marcosg432/cardapio_senna.git
cd cardapio_senna
```

### 4. Instalar dependências (opcional - servidor usa apenas Node.js nativo)
```bash
npm install
```

### 5. Iniciar aplicação com PM2
```bash
pm2 start ecosystem.config.cjs
```

### 6. Salvar configuração PM2 (para reinicialização)
```bash
pm2 save
pm2 startup
```

### 7. Verificar status
```bash
pm2 status
pm2 logs cardapio-senna
```

---

## Acesso ao site

O site ficará disponível em: **http://SEU_IP:3003**

Exemplo: `http://193.160.119.67:3003`

---

## Comandos úteis PM2

| Comando | Descrição |
|---------|-----------|
| `pm2 restart cardapio-senna` | Reiniciar app |
| `pm2 stop cardapio-senna` | Parar app |
| `pm2 delete cardapio-senna` | Remover do PM2 |

---

## Atualizar após alterações no GitHub

```bash
cd ~/cardapio_senna
git pull origin main
pm2 restart cardapio-senna
```
