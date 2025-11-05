/* validacao.js
   - Validação do formulário de cadastro (campos obrigatórios, formato de CPF, e-mail)
   - Mostra mensagens inline de erro (não só alert)
   - Armazena os cadastros no localStorage em um array 'voluntarios'
*/

function _criarSpanErro(paraElem, msg) {
  // remove mensagens antigas
  const existing = paraElem.parentElement.querySelector('.erro-msg');
  if (existing) existing.remove();

  const span = document.createElement('div');
  span.className = 'erro-msg';
  span.textContent = msg;
  span.style.color = '#b00020';
  span.style.fontSize = '0.9rem';
  span.style.marginTop = '6px';
  paraElem.parentElement.appendChild(span);
}

function _removerErro(paraElem) {
  const existing = paraElem.parentElement.querySelector('.erro-msg');
  if (existing) existing.remove();
}

function validarFormulario() {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();

    // pega valores e limpa espaços
    const nome = (form.querySelector('#nome')?.value || '').trim();
    const email = (form.querySelector('#email')?.value || '').trim();
    const cpf = (form.querySelector('#cpf')?.value || '').trim();
    const telefone = (form.querySelector('#telefone')?.value || '').trim();
    const endereco = (form.querySelector('#endereco')?.value || '').trim();
    const cep = (form.querySelector('#cep')?.value || '').trim();

    let valido = true;

    // nome
    const nomeEl = form.querySelector('#nome');
    if (!nome) {
      _criarSpanErro(nomeEl, 'Por favor, informe seu nome.');
      nomeEl.classList.add('input-erro');
      valido = false;
    } else {
      _removerErro(nomeEl);
      nomeEl.classList.remove('input-erro');
    }

    // email
    const emailEl = form.querySelector('#email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      _criarSpanErro(emailEl, 'Digite um e-mail válido.');
      emailEl.classList.add('input-erro');
      valido = false;
    } else {
      _removerErro(emailEl);
      emailEl.classList.remove('input-erro');
    }

    // cpf (formato 000.000.000-00)
    const cpfEl = form.querySelector('#cpf');
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpf || !cpfRegex.test(cpf)) {
      _criarSpanErro(cpfEl, 'CPF no formato 000.000.000-00');
      cpfEl.classList.add('input-erro');
      valido = false;
    } else {
      _removerErro(cpfEl);
      cpfEl.classList.remove('input-erro');
    }

    // telefone (simples)
    const telEl = form.querySelector('#telefone');
    const telRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    if (!telefone || !telRegex.test(telefone)) {
      _criarSpanErro(telEl, 'Digite um telefone válido. Ex: (11) 99999-0000');
      telEl.classList.add('input-erro');
      valido = false;
    } else {
      _removerErro(telEl);
      telEl.classList.remove('input-erro');
    }

    // CEP (opcional checagem formato)
    const cepEl = form.querySelector('#cep');
    if (cep && !/^\d{5}-\d{3}$/.test(cep)) {
      _criarSpanErro(cepEl, 'CEP no formato 00000-000');
      cepEl.classList.add('input-erro');
      valido = false;
    } else if (cepEl) {
      _removerErro(cepEl);
      cepEl.classList.remove('input-erro');
    }

    if (!valido) {
      // feedback geral
      if (typeof showToast === 'function') {
        showToast('Por favor corrija os erros no formulário.', { type: 'error' });
      } else {
        alert('Por favor corrija os erros no formulário.');
      }
      return;
    }

    // se válido, salva no localStorage (array)
    const voluntario = {
      nome, email, cpf, telefone, endereco, cep,
      data: new Date().toISOString()
    };

    let lista = [];
    try {
      lista = JSON.parse(localStorage.getItem('voluntarios') || '[]');
      if (!Array.isArray(lista)) lista = [];
    } catch (e) {
      lista = [];
    }
    lista.push(voluntario);
    localStorage.setItem('voluntarios', JSON.stringify(lista));

    // feedback e reset
    if (typeof showToast === 'function') {
      showToast('Cadastro realizado com sucesso!', { type: 'success' });
    } else {
      alert('Cadastro realizado com sucesso!');
    }

    form.reset();

    // opcional: disparar uma ação depois do cadastro (por exemplo, atualizar lista)
    if (typeof afterFormSubmit === 'function') afterFormSubmit(voluntario);
  });
}
