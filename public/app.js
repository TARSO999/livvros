// 1) Pegar os elementos da tela
const form = document.getElementById("form");
const lista = document.getElementById("lista");
const erro = document.getElementById("erro");

// 2) Buscar os livros na API e mostrar na tela
async function carregarLivros() {
    const resposta = await fetch("/livros");
    const livros = await resposta.json();

    lista.innerHTML = "";

    livros.forEach((livro) => {
        const item = document.createElement("li");
        const anoTexto = livro.ano ? `(${livro.ano})` : "";

        item.innerHTML = `
            <span>${livro.titulo} - ${livro.autor} ${anoTexto}</span>
            <button class="del" data-id="${livro.id}">Excluir</button>
        `;
        lista.appendChild(item);
    });
}

// 3) Cadastrar um livro
form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    erro.textContent = "";

    const dados = {
        titulo: document.getElementById("titulo").value,
        autor: document.getElementById("autor").value,
        ano: document.getElementById("ano").value,
        pag: document.getElementById("pag").value,
        editora: document.getElementById("editora").value,
    };

    // Envia a requisição POST para criar um livro
    const resposta = await fetch("/livros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
        const info = await resposta.json();
        erro.textContent = info.erro;
        return;
    }

    form.reset();
    carregarLivros();
});

// 4) Apagar um livro (DELETE)
lista.addEventListener("click", async (evento) => {
    if (!evento.target.dataset.id) return;

    await fetch(`/livros/${evento.target.dataset.id}`, { method: "DELETE" });

    carregarLivros();
});

carregarLivros();
