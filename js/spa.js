/* spa.js
   - Inicia um SPA simples: intercepta cliques em links do nav,
     busca o HTML da página alvo e injeta o conteúdo do <main>
   - Também fornece um sistema simples de "templates" JS para
     injetar cards de projetos dinamicamente.
*/

/* ---------- Dados (exemplo) ---------- */
const projetosData = [
  {
    id: 1,
    titulo: "Projeto Luz do Saber",
    descricao: "Alfabetização de jovens e adultos em situação de vulnerabilidade.",
    img: "../imagens/projeto1.jpg",
    tags: ["educação", "alfabetização"]
  },
  {
    id: 2,
    titulo: "Projeto Mãos que Ajudam",
    descricao: "Arrecadação e distribuição de alimentos, roupas e produtos de higiene.",
    img: "../imagens/projeto2.jpg",
    tags: ["assistência", "voluntariado"]
  }
];

/* ---------- Função de template simples ---------- */
function projetoCardTemplate(proj) {
  // Usa template strings para montar um card
  return `
    <article class="card-projeto" data-id="${proj.id}">
      <img src="${proj.img}" alt="${proj.titulo}" class="card-img" />
      <div class="card-body">
        <h3>${proj.titulo}</h3>
        <p>${proj.descricao}</p>
        <div class="tags">
          ${proj.tags.map(t => `<span class="badge">${t}</span>`).join(' ')}
        </div>
        <button class="btn-detalhes" data-id="${proj.id}">Ver detalhes</button>
      </div>
    </article>
  `;
}

/* ---------- Renderizador de projetos ---------- */
function renderProjects(containerSelector = '#projects-list') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = projetosData.map(projetoCardTemplate).join('');
  // adiciona event listeners aos botões de detalhes
  container.querySelectorAll('.btn-detalhes').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      abrirModalProjeto(id);
    });
  });
}

/* ---------- Modal simples para detalhes do projeto ---------- */
function abrirModalProjeto(id) {
  const proj = projetosData.find(p => String(p.id) === String(id));
  if (!proj) return alert('Projeto não encontrado.');

  // cria modal dinamicamente
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close">&times;</button>
      <h2>${proj.titulo}</h2>
      <img src="${proj.img}" alt="${proj.titulo}" style="max-width:100%;height:auto;margin-bottom:12px;">
      <p>${proj.descricao}</p>
      <div class="tags">${proj.tags.map(t => `<span class="badge">${t}</span>`).join(' ')}</div>
    </div>
  `;
  document.body.appendChild(modal);

  // fecha modal
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (ev) => {
    if (ev.target === modal) modal.remove();
  });
}

/* ---------- SPA (fetch + replace main) ---------- */
function iniciarSPA() {
  const navLinks = document.querySelectorAll('nav a');
  const main = document.querySelector('main');
  if (!main || navLinks.length === 0) return;

  // intercepta cliques nos links do nav
  navLinks.forEach(link => {
    link.addEventListener('click', (ev) => {
      // se link aponta para âncora externa ou tem target, siga normalmente
      if (link.target && link.target !== '_self') return;

      ev.preventDefault();
      const href = link.getAttribute('href');

      // Faz fetch do arquivo HTML e injeta apenas o <main>
      fetch(href).then(res => {
        if (!res.ok) throw new Error('Falha ao carregar página');
        return res.text();
      }).then(htmlString => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const novoMain = doc.querySelector('main');
        if (novoMain) {
          main.innerHTML = novoMain.innerHTML;

          // Atualiza o histórico do navegador (permitir voltar)
          history.pushState({ url: href }, '', href);

          // Depois de injetar, re-executa comportamentos necessários:
          //  - renderizar cards se estivermos na página de projetos
          //  - re-ligação de validação de formulário (se existir um)
          //  - outros scripts que dependem do DOM atual
          // Chamamos uma função de "hook" que o main.js espera (se existir)
          if (typeof afterContentLoad === 'function') afterContentLoad();
        } else {
          // se não encontrou <main>, injeta o HTML todo
          main.innerHTML = htmlString;
          if (typeof afterContentLoad === 'function') afterContentLoad();
        }
      }).catch(err => {
        console.error(err);
        main.innerHTML = `<section><p>Erro ao carregar a página. Tente novamente.</p></section>`;
      });
    });
  });

  // Trata o botão de voltar/avançar do browser
  window.addEventListener('popstate', (ev) => {
    const state = ev.state;
    if (state && state.url) {
      fetch(state.url)
        .then(r => r.text())
        .then(text => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const novoMain = doc.querySelector('main');
          const main = document.querySelector('main');
          main.innerHTML = novoMain ? novoMain.innerHTML : text;
          if (typeof afterContentLoad === 'function') afterContentLoad();
        });
    }
  });
}
