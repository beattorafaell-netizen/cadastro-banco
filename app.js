const form = document.getElementById("form");
const msg = document.getElementById("msg");
const tbody = document.getElementById("tbody");
const busca = document.getElementById("busca");
const btnLimpar = document.getElementById("btnLimpar");

// API do Node
const API = "http://localhost:3001/api/empresas";

function setMsg(texto, isError = false) {
  msg.textContent = texto;
  msg.classList.toggle("error", isError);
}

let cache = [];

function render(lista) {
  tbody.innerHTML = "";

  if (lista.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" style="color:#666;">Nenhuma empresa cadastrada.</td>`;
    tbody.appendChild(tr);
    return;
  }

  for (const e of lista) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.id}</td>
      <td>${e.nome}</td>
      <td>${e.cnpj}</td>
      <td>${new Date(e.created_at).toLocaleString("pt-BR")}</td>
      <td class="actions"><small>OK</small></td>
    `;
    tbody.appendChild(tr);
  }
}

function filtrar() {
  const termo = (busca.value || "").toLowerCase().trim();
  const filtrada = termo
    ? cache.filter(e =>
        e.nome.toLowerCase().includes(termo) ||
        e.cnpj.toLowerCase().includes(termo)
      )
    : cache;

  render(filtrada);
}

async function carregar() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    cache = data;
    filtrar();
  } catch (err) {
    setMsg("Erro ao carregar da API. Veja se o backend está rodando.", true);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("Enviando...");

  const nome = document.getElementById("nome").value.trim();
  const cnpj = document.getElementById("cnpj").value.trim();

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cnpj }),
    });

    const out = await res.json();

    if (!res.ok) {
      setMsg(out.error || "Erro ao cadastrar", true);
      return;
    }

    setMsg("Cadastrado! ID = " + out.id);
    form.reset();
    carregar();
  } catch (err) {
    setMsg("Falha no POST. Veja o console (F12).", true);
  }
});

busca.addEventListener("input", filtrar);

btnLimpar.addEventListener("click", () => {
  setMsg("Esse botão era do localStorage. Depois fazemos DELETE no banco.", true);
});

carregar();