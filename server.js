// API de Livros com SQlite (better-sqlite3)
const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.static("public"));

// 1) Conecta no arquivo do banco (cria se não existir)
const db = new Database("biblioteca.db");

// 2) Criar a tabela (tirei o NOT NULL de editora para aceitar vazio se você não enviar)
db.exec(`
    CREATE TABLE IF NOT EXISTS livros (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo  TEXT NOT NULL,
        autor   TEXT NOT NULL,
        ano     INTEGER,
        pag     INTEGER,
        editora TEXT
    )
`);

// 3) Listar todos
app.get("/livros", (req, res) => {
    try {
        const livros = db.prepare("SELECT * FROM livros").all();
        res.status(200).json(livros);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao listar livros" });
    }
});

// 4) Buscar por Id
app.get("/livros/:id", (req, res) => {
    try {
        const livro = db.prepare("SELECT * FROM livros WHERE id = ?").get(req.params.id);
        if (!livro) return res.status(404).json({ erro: "Livro não encontrado" });
        res.status(200).json(livro);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar livro" });
    }
});

// 5) CADASTRAR
app.post("/livros", (req, res) => {
    const { titulo, autor, ano, pag, editora } = req.body || {};
    if (!titulo || !autor) return res.status(400).json({ erro: "Informe titulo e autor" });

    const anoNumero = ano !== undefined && ano !== null && ano !== "" ? Number(ano) : null;
    if (anoNumero !== null && Number.isNaN(anoNumero)) {
        return res.status(400).json({ erro: "Ano inválido" });
    }

    const pagNumero = pag !== undefined && pag !== null && pag !== "" ? Number(pag) : null;
    if (pagNumero !== null && Number.isNaN(pagNumero)) {
        return res.status(400).json({ erro: "Número de páginas inválido" });
    }

    try {
        const info = db
            .prepare("INSERT INTO livros (titulo, autor, ano, pag, editora) VALUES (?, ?, ?, ?, ?)")
            .run(titulo, autor, anoNumero, pagNumero, editora || null);

        res.status(201).json({
            id: Number(info.lastInsertRowid),
            titulo,
            autor,
            ano: anoNumero,
            pag: pagNumero,
            editora: editora || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao cadastrar livro" });
    }
});

// 6) DELETE
app.delete("/livros/:id", (req, res) => {
    try {
        const info = db.prepare("DELETE FROM livros WHERE id = ?").run(req.params.id);
        if (info.changes === 0) return res.status(404).json({ erro: "Livro não encontrado" });
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ erro: "Erro ao apagar livro" });
    }
});

app.listen(PORT, () => {
    console.log(`API Livros no ar: http://localhost:${PORT}`);
});
