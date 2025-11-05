/* main.js
   - Inicializa comportamentos gerais do site:
     * menu mobile (toggle)
     * toasts (mensagens rápidas)
     * integra com SPA e validação (hooks)
     * ao injetar novo conteúdo, re-executa funções necessárias
*/

/* ---------- Toasts simples ---------- */
function showToast(message, opts = {}) {
  // opts: { type: 'success'|'error'|'info', duration: ms }
  const duration = opts.duration || 3500;
  const type = opts.type || 'info';

  const containerId = 'toast-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.top = '16px';
    container.style.right = '16px';
    container.style.zIndex = 9999;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.marginTop = '8px';
  toast.style.padding = '10px 14px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
  toast.style.background = type === 'success' ? '#2e7d32' : type === 'error' ? '#b00020' : '#333';
  toast.style.color = '#fff';
  toast.style.fontSize = '14px';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 250ms ease';

  container.appendChild(toast);
  // fade in
  requestAnimationFrame(() => { toast.style.opacity = '1'; });

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ---------- Hook executado sempre que novo conteúdo é carregado no <main> ---------- */
function afterContentLoad() {
  // Se houver uma área de projetos, renderize os cards
  if (document.querySelector('#projects-list')) {
    if (typeof renderProjects === 'function') {
      renderProjects('#projects-list');
    }
  }

  // Se houver formulário na nova view, reativa validação
  if (document.querySelector('form')) {
    if (typeof validarFormulario === 'function') {
      // chamar a função que instala o eventListener
      validarFormulario();
    }
  }

  // reaplica clique do menu (por segurança)
  setupMenuToggle();
}

/* ---------- Menu mobile (toggle) ---------- */
function setupMenuToggle() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('ativo');
    // classe 'ativo' pode exibir o nav no CSS para telas pequenas
  });
}

/* ---------- Ação após envio do formulário (opcional) ---------- */
function afterFormSubmit(cadastroObj) {
  // Exemplo: abrir uma pequena modal / ou atualizar lista local
  showToast('Obrigado por se inscrever — verificaremos seu cadastro!', { type: 'success' });

  // opcional: atualizar uma lista exibida em tela
  const listaEl = document.querySelector('#lista-voluntarios');
  if (listaEl) {
    const li = document.createElement('li');
    li.textContent = `${cadastroObj.nome} — ${cadastroObj.email}`;
    listaEl.appendChild(li);
  }
}

/* ---------- Inicialização principal ---------- */
document.addEventListener('DOMContentLoaded', () => {
  setupMenuToggle();

  // inicia SPA — se função disponível
  if (typeof iniciarSPA === 'function') iniciarSPA();

  // executa afterContentLoad para a carga inicial
  afterContentLoad();
});
