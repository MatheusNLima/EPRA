let tutoriaisCarregados = [];
let imagensMantidas = [];
let portfolioCarregados = [];
let imagensMantidasPortfolio = [];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('usuario');

    if (!token || !userStr) {
        window.location.href = 'login.html'; 
        return;
    }
    const user = JSON.parse(userStr);
    if (user.tipo !== 'COORDENADOR' && user.tipo !== 'ORIENTADOR' && user.tipo !== 'ADMIN' && user.tipo !== 'ALUNO_INTERNO') {
        window.location.href = 'login.html'; 
        return;
    }

    // 🛡️ ESCUDO DE UX: Defesa contra fecho prematuro do HTML
    // Varremos todos os botões de submissão do painel e removemos ordens diretas de fecho.
    // Assim, apenas o JavaScript decide quando o modal pode ser fechado (apenas no sucesso!).
    document.querySelectorAll('form button[type="submit"]').forEach(btn => {
        btn.removeAttribute('onclick');
        btn.removeAttribute('data-dismiss');
        btn.removeAttribute('data-bs-dismiss');
    });

    carregarCursosAdmin();
    carregarVagasAdmin();
    carregarTutoriaisAdmin();
    carregarPortfolioAdmin();
    carregarDesafiosAdmin();

    const hojeStr = new Date().toISOString().split('T')[0];
    const inputData = document.getElementById('dataLimiteVaga');
    if (inputData) inputData.min = hojeStr;
    const inputEditData = document.getElementById('editDataLimiteVaga');
    if (inputEditData) inputEditData.min = hojeStr;
});

// --- FUNÇÕES DE INTERFACE ---
window.abrirAba = function(evento, idAba) {
    const conteudos = document.getElementsByClassName("tab-content");
    for (let i = 0; i < conteudos.length; i++) conteudos[i].classList.remove("active");

    const botoes = document.getElementsByClassName("tab-link");
    for (let i = 0; i < botoes.length; i++) botoes[i].classList.remove("active");

    document.getElementById(idAba).classList.add("active");
    evento.currentTarget.classList.add("active");
};

window.abrirModal = function(idModal) {
    document.getElementById(idModal).style.display = 'flex';
    const msgCurso = document.getElementById(idModal === 'modalCurso' ? 'mensagemFeedback' : 'msgEditFeedback');
    if (msgCurso) msgCurso.style.display = 'none';
    const msgVaga = document.getElementById(idModal === 'modalVaga' ? 'mensagemFeedbackVaga' : 'msgEditFeedbackVaga');
    if (msgVaga) msgVaga.style.display = 'none';
};

window.fecharModal = function(idModal) {
    document.getElementById(idModal).style.display = 'none';
    const form = document.querySelector(`#${idModal} form`);
    if (form) form.reset();
    const msgCurso = document.getElementById(idModal === 'modalCurso' ? 'mensagemFeedback' : 'msgEditFeedback');
    if (msgCurso) msgCurso.style.display = 'none';
    const msgVaga = document.getElementById(idModal === 'modalVaga' ? 'mensagemFeedbackVaga' : 'msgEditFeedbackVaga');
    if (msgVaga) msgVaga.style.display = 'none';
    
    const msgDesafio = document.getElementById(idModal === 'modalDesafio' ? 'mensagemFeedbackDesafio' : 'msgEditFeedbackDesafio');
    if (msgDesafio) msgDesafio.style.display = 'none';

    const msgTutorial = document.getElementById(idModal === 'modalTutorial' ? 'mensagemFeedbackTutorial' : 'msgEditFeedbackTutorial');
    if (msgTutorial) msgTutorial.style.display = 'none';

    const msgPortfolio = document.getElementById(idModal === 'modalPortfolio' ? 'mensagemFeedbackPortfolio' : 'msgEditFeedbackPortfolio');
    if (msgPortfolio) msgPortfolio.style.display = 'none';

    if (idModal === 'modalTutorial' || idModal === 'modalEditarTutorial') {
        const previewCriar = document.getElementById('previewImagensTutorial');
        if (previewCriar) previewCriar.innerHTML = '';
        const previewNovoEditar = document.getElementById('previewNovasImagensTutorial');
        if (previewNovoEditar) previewNovoEditar.innerHTML = '';
        const containerExistente = document.getElementById('containerImagensExistentes');
        if (containerExistente) containerExistente.innerHTML = '';
        imagensMantidas = [];
        
        const btnSalvar = document.getElementById('btnSalvarTutorial');
        if (btnSalvar) btnSalvar.disabled = false;
        const btnAtualizar = document.getElementById('btnAtualizarTutorial');
        if (btnAtualizar) btnAtualizar.disabled = false;
    }

    if (idModal === 'modalPortfolio' || idModal === 'modalEditarPortfolio') {
        const previewCriar = document.getElementById('previewImagensPortfolio');
        if (previewCriar) previewCriar.innerHTML = '';
        const previewNovoEditar = document.getElementById('previewNovasImagensPortfolio');
        if (previewNovoEditar) previewNovoEditar.innerHTML = '';
        const containerExistente = document.getElementById('containerImagensExistentesPortfolio');
        if (containerExistente) containerExistente.innerHTML = '';
        imagensMantidasPortfolio = [];
        
        const btnSalvar = document.getElementById('btnSalvarPortfolio');
        if (btnSalvar) btnSalvar.disabled = false;
        const btnAtualizar = document.getElementById('btnAtualizarPortfolio');
        if (btnAtualizar) btnAtualizar.disabled = false;
    }
};

window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
};

// --- GESTÃO DE CURSOS ---
window.verificarStatusResponse = function(response) {
    if (response.status === 401 || response.status === 403) {
        alert('Sua sessão expirou ou é inválida. Por favor, faça login novamente.');
        window.logout();
        return false;
    }
    return true;
};

// --- FUNÇÕES DE COMUNICAÇÃO COM O BACKEND ---

async function carregarCursosAdmin() {
    const tbody = document.getElementById('corpoTabelaCursos');
    if (!tbody) return;
    
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3000/api/cursos', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Erro na resposta do servidor ao listar cursos.</td></tr>';
            return;
        }

        const cursos = await response.json();
        tbody.innerHTML = ''; 
        
        if (cursos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhum curso cadastrado ainda.</td></tr>';
            return;
        }

        cursos.forEach(curso => {
            const dataFormatada = curso.datainicio ? new Date(curso.datainicio).toLocaleDateString('pt-BR') : 'A definir';
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 500;">${curso.titulo}</td>
                    <td>${dataFormatada}</td>
                    <td>${curso.vagas}</td>
                    <td>
                        <button class="btn-sm btn-info" onclick="gerenciarInscritos(${curso.id}, '${curso.titulo}')">👥 Inscritos</button>
                        <button class="btn-sm btn-edit" onclick="editarCurso(${curso.id})">Editar</button>
                        <button class="btn-sm btn-delete" onclick="excluirCurso(${curso.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Erro ao ligar ao servidor.</td></tr>';
    }
}

document.getElementById('formCurso').addEventListener('submit', async (e) => {
    e.preventDefault();
    const curso = {
        titulo: document.getElementById('tituloCurso').value,
        descricao: document.getElementById('descricaoCurso').value,
        datainicio: document.getElementById('dataInicio').value,
        vagas: document.getElementById('vagas').value
    };
    const token = localStorage.getItem('token');
    const msgFeedback = document.getElementById('mensagemFeedback');

    try {
        const response = await fetch('http://localhost:3000/api/cursos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(curso)
        });

        if (!window.verificarStatusResponse(response)) return;

        if (response.ok) {
            msgFeedback.innerText = 'Curso criado com sucesso!';
            msgFeedback.style.color = '#28a745';
            msgFeedback.style.display = 'block';
            document.getElementById('formCurso').reset();
            carregarCursosAdmin();
            setTimeout(() => { fecharModal('modalCurso'); }, 1500);
        } else {
            msgFeedback.innerText = 'Erro ao criar o curso.';
            msgFeedback.style.color = '#d9534f';
            msgFeedback.style.display = 'block';
        }
    } catch (err) {
        msgFeedback.innerText = 'Servidor indisponível.';
        msgFeedback.style.color = '#d9534f';
        msgFeedback.style.display = 'block';
    }
});

window.editarCurso = async function(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/cursos/${id}`);
        if (!response.ok) throw new Error('Curso não encontrado');
        const curso = await response.json();

        document.getElementById('editIdCurso').value = curso.id;
        document.getElementById('editTitulo').value = curso.titulo;
        document.getElementById('editDescricao').value = curso.descricao;
        document.getElementById('editVagas').value = curso.vagas;
        
        if(curso.datainicio) {
            const dataObj = new Date(curso.datainicio);
            const ano = dataObj.getFullYear();
            const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
            const dia = String(dataObj.getDate()).padStart(2, '0');
            document.getElementById('editDataInicio').value = `${ano}-${mes}-${dia}`;
        }

        abrirModal('modalEditarCurso');
    } catch (error) {
        alert('Erro ao procurar os dados do curso.');
    }
};

document.getElementById('formEditarCurso').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editIdCurso').value;
    const cursoAtualizado = {
        titulo: document.getElementById('editTitulo').value,
        descricao: document.getElementById('editDescricao').value,
        datainicio: document.getElementById('editDataInicio').value,
        vagas: document.getElementById('editVagas').value
    };

    const token = localStorage.getItem('token');
    const msgFeedback = document.getElementById('msgEditFeedback');

    try {
        const response = await fetch(`http://localhost:3000/api/cursos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(cursoAtualizado)
        });

        if (!window.verificarStatusResponse(response)) return;

        if (response.ok) {
            msgFeedback.innerText = 'Curso atualizado com sucesso!';
            msgFeedback.style.color = '#28a745';
            msgFeedback.style.display = 'block';
            carregarCursosAdmin();
            setTimeout(() => { fecharModal('modalEditarCurso'); }, 1500);
        } else {
            msgFeedback.innerText = 'Erro ao atualizar. Verifica as permissões.';
            msgFeedback.style.color = '#d9534f';
            msgFeedback.style.display = 'block';
        }
    } catch (err) {
        msgFeedback.innerText = 'Servidor indisponível.';
        msgFeedback.style.color = '#d9534f';
        msgFeedback.style.display = 'block';
    }
});

window.excluirCurso = function(id) {
    document.getElementById('idParaExcluir').value = id;
    abrirModal('modalConfirmacao');
};

window.confirmarExclusao = async function() {
    const id = document.getElementById('idParaExcluir').value;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:3000/api/cursos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!window.verificarStatusResponse(response)) return;

        if (response.ok) {
            fecharModal('modalConfirmacao');
            carregarCursosAdmin(); 
        } else {
            alert("Erro ao excluir o curso.");
        }
    } catch (error) {
        console.error(error);
        alert("Servidor indisponível.");
    }
};

// --- GESTÃO DE ALUNOS E INSCRIÇÕES ---

window.gerenciarInscritos = async function(cursoId, tituloCurso) {
    document.getElementById('tituloModalInscritos').innerText = `Inscritos: ${tituloCurso}`;
    document.getElementById('manualCursoId').value = cursoId;
    document.getElementById('formInscricaoManual').style.display = 'none';
    
    await atualizarTabelaInscritos(cursoId);
    abrirModal('modalInscritos');
};

async function atualizarTabelaInscritos(cursoId) {
    const tbody = document.getElementById('corpoTabelaInscritos');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Buscando alunos...</td></tr>';
    
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:3000/api/inscricoes/curso/${cursoId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Acesso negado pelo servidor');

        const inscritos = await response.json();
        tbody.innerHTML = '';

        if (inscritos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum aluno inscrito neste curso.</td></tr>';
            return;
        }

        inscritos.forEach(aluno => {
            const nomeSeguro = aluno.nome ? aluno.nome.replace(/'/g, "\\'") : '';
            
            let btnTermo = '<span style="color:#999; font-size:0.85rem;">Sem anexo</span>';
            if (aluno.termo_consentimento) {
                const caminhoCorrigido = aluno.termo_consentimento.replace(/\\/g, '/');
                btnTermo = `<a href="http://localhost:3000/${caminhoCorrigido}" target="_blank" class="btn-sm btn-info" style="text-decoration:none; display:inline-block; text-align:center;">Ver PDF</a>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>${aluno.nome}</td>
                    <td>${aluno.documento}</td>
                    <td>${aluno.email}</td>
                    <td>${btnTermo}</td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="abrirEdicaoInscrito(${aluno.id}, '${nomeSeguro}', '${aluno.documento}', '${aluno.email}', ${cursoId})">Editar</button>
                        <button class="btn-sm btn-delete" onclick="removerInscrito(${aluno.id}, ${cursoId})">Remover</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Erro ao carregar dados.</td></tr>';
    }
}

window.exibirFormularioInscricaoManual = function() {
    document.getElementById('formInscricaoManual').style.display = 'block';
};

document.getElementById('formInscricaoManual').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cursoId = document.getElementById('manualCursoId').value;
    const token = localStorage.getItem('token');

    const dados = {
        curso_id: cursoId,
        nome: document.getElementById('manualNome').value,
        documento: document.getElementById('manualDocumento').value,
        email: document.getElementById('manualEmail').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/inscricoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            alert('Aluno inscrito manualmente com sucesso!');
            document.getElementById('formInscricaoManual').reset();
            // A JANELA SÓ SE ESCONDE AQUI, SE TUDO CORRER BEM:
            document.getElementById('formInscricaoManual').style.display = 'none';
            atualizarTabelaInscritos(cursoId);
        } else {
            const erroData = await response.json();
            alert(`⚠️ Atenção: ${erroData.erro}`);
            // Se der erro, não fazemos nada! O formulário fica intocável e aberto.
        }
    } catch (error) {
        alert('Servidor fora do ar.');
    }
});

window.removerInscrito = async function(inscricaoId, cursoId) {
    if (confirm("Deseja mesmo cancelar a inscrição deste aluno?")) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/api/inscricoes/${inscricaoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                atualizarTabelaInscritos(cursoId);
            } else {
                alert('Erro ao cancelar.');
            }
        } catch (error) {
            alert('Erro de conexão.');
        }
    }
};

window.abrirEdicaoInscrito = function(id, nome, documento, email, cursoId) {
    document.getElementById('editInscritoId').value = id;
    document.getElementById('editInscritoCursoId').value = cursoId;
    document.getElementById('editInscritoNome').value = nome;
    document.getElementById('editInscritoDocumento').value = documento;
    document.getElementById('editInscritoEmail').value = email;
    
    abrirModal('modalEditarInscrito');
};

document.getElementById('formEditarInscrito').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editInscritoId').value;
    const cursoId = document.getElementById('editInscritoCursoId').value;
    const token = localStorage.getItem('token');
    
    const dados = {
        nome: document.getElementById('editInscritoNome').value,
        documento: document.getElementById('editInscritoDocumento').value,
        email: document.getElementById('editInscritoEmail').value
    };

    try {
        const response = await fetch(`http://localhost:3000/api/inscricoes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            alert('Dados do aluno atualizados com sucesso!');
            // A JANELA SÓ SE FECHA AQUI:
            fecharModal('modalEditarInscrito');
            atualizarTabelaInscritos(cursoId);
        } else {
            const erroData = await response.json();
            alert(`⚠️ Atenção: ${erroData.erro}`);
            // Se der erro, não fazemos nada! O formulário fica intocável e aberto.
        }
    } catch (error) {
        alert('Servidor indisponível.');
    }
});

// --- GESTÃO DE VAGAS ---

async function carregarVagasAdmin() {
    const tbody = document.getElementById('corpoTabelaVagas');
    if(!tbody) return; 
    
    try {
        const response = await fetch('http://localhost:3000/api/vagas');
        const vagas = await response.json();
        tbody.innerHTML = ''; 
        
        if (vagas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhuma vaga cadastrada ainda.</td></tr>';
            return;
        }

        vagas.forEach(vaga => {
            const dataFormatada = vaga.datalimite ? new Date(vaga.datalimite).toLocaleDateString('pt-BR') : 'A definir';
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 500;">${vaga.titulo}</td>
                    <td>${dataFormatada}</td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="editarVaga(${vaga.id})">Editar</button>
                        <button class="btn-sm btn-delete" onclick="excluirVaga(${vaga.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Erro ao carregar dados.</td></tr>';
    }
}

const formVaga = document.getElementById('formVaga');
if(formVaga) {
    formVaga.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titulo = document.getElementById('tituloVaga').value;
        const descricao = document.getElementById('descricaoVaga').value;
        const datalimite = document.getElementById('dataLimiteVaga').value;
        const msgFeedback = document.getElementById('mensagemFeedbackVaga');

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataSelecionada = new Date(datalimite + 'T00:00:00');

        if (dataSelecionada < hoje) {
            msgFeedback.innerText = 'A data limite não pode ser no passado.';
            msgFeedback.style.color = '#d9534f';
            msgFeedback.style.display = 'block';
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3000/api/vagas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ titulo, descricao, datalimite })
            });

            if (!window.verificarStatusResponse(response)) return;

            if (response.ok) {
                msgFeedback.innerText = 'Vaga criada com sucesso!';
                msgFeedback.style.color = '#28a745';
                msgFeedback.style.display = 'block';
                document.getElementById('formVaga').reset();
                carregarVagasAdmin();
                setTimeout(() => { fecharModal('modalVaga'); }, 1500);
            } else {
                msgFeedback.innerText = 'Erro ao criar a vaga.';
                msgFeedback.style.color = '#d9534f';
                msgFeedback.style.display = 'block';
            }
        } catch (err) {
            msgFeedback.innerText = 'Servidor indisponível.';
            msgFeedback.style.color = '#d9534f';
            msgFeedback.style.display = 'block';
        }
    });
}

window.editarVaga = async function(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/vagas/${id}`);
        if (!response.ok) throw new Error('Vaga não encontrada');
        const vaga = await response.json();

        document.getElementById('editIdVaga').value = vaga.id;
        document.getElementById('editTituloVaga').value = vaga.titulo;
        document.getElementById('editDescricaoVaga').value = vaga.descricao;
        
        if (vaga.datalimite) {
            let dataString = '';
            if (typeof vaga.datalimite === 'string') {
                dataString = vaga.datalimite.substring(0, 10);
            } else {
                const dateObj = new Date(vaga.datalimite);
                const ano = dateObj.getFullYear();
                const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dia = String(dateObj.getDate()).padStart(2, '0');
                dataString = `${ano}-${mes}-${dia}`;
            }
            document.getElementById('editDataLimiteVaga').value = dataString;
        }

        abrirModal('modalEditarVaga');
    } catch (error) {
        alert('Erro ao procurar os dados da vaga.');
    }
};

const formEditarVaga = document.getElementById('formEditarVaga');
if(formEditarVaga) {
    formEditarVaga.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editIdVaga').value;
        const titulo = document.getElementById('editTituloVaga').value;
        const descricao = document.getElementById('editDescricaoVaga').value;
        const datalimite = document.getElementById('editDataLimiteVaga').value;
        const msgFeedback = document.getElementById('msgEditFeedbackVaga');

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataSelecionada = new Date(datalimite + 'T00:00:00');

        if (dataSelecionada < hoje) {
            msgFeedback.innerText = 'A data limite não pode ser no passado.';
            msgFeedback.style.color = '#d9534f';
            msgFeedback.style.display = 'block';
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/api/vagas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ titulo, descricao, datalimite })
            });

            if (!window.verificarStatusResponse(response)) return;

            if (response.ok) {
                msgFeedback.innerText = 'Vaga atualizada com sucesso!';
                msgFeedback.style.color = '#28a745';
                msgFeedback.style.display = 'block';
                carregarVagasAdmin();
                setTimeout(() => { fecharModal('modalEditarVaga'); }, 1500);
            } else {
                msgFeedback.innerText = 'Erro ao atualizar. Verifica as permissões.';
                msgFeedback.style.color = '#d9534f';
                msgFeedback.style.display = 'block';
            }
        } catch (err) {
            msgFeedback.innerText = 'Servidor indisponível.';
            msgFeedback.style.color = '#d9534f';
            msgFeedback.style.display = 'block';
        }
    });
}

window.excluirVaga = function(id) {
    document.getElementById('idParaExcluirVaga').value = id;
    abrirModal('modalConfirmacaoVaga');
};

window.confirmarExclusaoVaga = async function() {
    const id = document.getElementById('idParaExcluirVaga').value;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:3000/api/vagas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!window.verificarStatusResponse(response)) return;

        if (response.ok) {
            fecharModal('modalConfirmacaoVaga');
            carregarVagasAdmin();
        } else {
            alert("Erro ao excluir a vaga.");
        }
    } catch (error) {
        console.error(error);
        alert("Servidor indisponível.");
    }
};

// --- GESTÃO DE TUTORIAIS ---

async function carregarTutoriaisAdmin() {
    const tbody = document.getElementById('corpoTabelaTutoriais');
    if(!tbody) return;

    try {
        const response = await fetch('http://localhost:3000/api/tutoriais');
        if (!response.ok) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Erro ao ligar ao servidor.</td></tr>';
            return;
        }
        const tutoriais = await response.json();
        tutoriaisCarregados = tutoriais;
        tbody.innerHTML = ''; 
        
        if (tutoriais.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhum tutorial cadastrado ainda.</td></tr>';
            return;
        }

        tutoriais.forEach(tutorial => {
            const tagsBadges = tutorial.tags 
                ? tutorial.tags.split(',').map(t => `<span class="tag-badge">${t.trim()}</span>`).join('') 
                : '<em style="color:#aaa;">sem tags</em>';
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 500;">${tutorial.titulo}</td>
                    <td>${tagsBadges}</td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="editarTutorial(${tutorial.id})">Editar</button>
                        <button class="btn-sm btn-delete" onclick="excluirTutorial(${tutorial.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Erro ao ligar ao servidor.</td></tr>';
    }
}

const inputImagens = document.getElementById('imagensTutorial');
if (inputImagens) {
    inputImagens.addEventListener('change', function() {
        const preview = document.getElementById('previewImagensTutorial');
        const feedback = document.getElementById('mensagemFeedbackTutorial');
        const btnSalvar = document.getElementById('btnSalvarTutorial');
        
        preview.innerHTML = '';
        feedback.style.display = 'none';
        btnSalvar.disabled = false;
        
        if (this.files.length > 5) {
            feedback.innerText = 'O máximo de imagens permitido é 5.';
            feedback.style.color = '#d9534f';
            feedback.style.display = 'block';
            btnSalvar.disabled = true;
            this.value = '';
            return;
        }
        
        Array.from(this.files).forEach(file => {
            const url = URL.createObjectURL(file);
            preview.innerHTML += `<div class="preview-container"><img src="${url}"></div>`;
        });
    });
}

const formTutorial = document.getElementById('formTutorial');
if (formTutorial) {
    formTutorial.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const feedback = document.getElementById('mensagemFeedbackTutorial');
        const btnSalvar = document.getElementById('btnSalvarTutorial');
        
        btnSalvar.disabled = true;
        
        const formData = new FormData(this);
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:3000/api/tutoriais', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            if (!window.verificarStatusResponse(response)) return;

            if (response.ok) {
                feedback.innerText = 'Tutorial criado com sucesso!';
                feedback.style.color = '#28a745';
                feedback.style.display = 'block';
                this.reset();
                const preview = document.getElementById('previewImagensTutorial');
                if (preview) preview.innerHTML = '';
                carregarTutoriaisAdmin();
                setTimeout(() => { fecharModal('modalTutorial'); }, 1500);
            } else {
                const data = await response.json();
                feedback.innerText = data.error || 'Erro ao criar o tutorial.';
                feedback.style.color = '#d9534f';
                feedback.style.display = 'block';
                btnSalvar.disabled = false;
            }
        } catch (err) {
            feedback.innerText = 'Servidor indisponível.';
            feedback.style.color = '#d9534f';
            feedback.style.display = 'block';
            btnSalvar.disabled = false;
        }
    });
}

window.editarTutorial = function(id) {
    const tutorial = tutoriaisCarregados.find(t => t.id === id);
    if (!tutorial) {
        alert('Tutorial não encontrado.');
        return;
    }
    
    document.getElementById('editIdTutorial').value = tutorial.id;
    document.getElementById('editTituloTutorial').value = tutorial.titulo;
    document.getElementById('editDescricaoTutorial').value = tutorial.descricao || '';
    document.getElementById('editConteudoTutorial').value = tutorial.conteudo;
    document.getElementById('editLinkgithubTutorial').value = tutorial.linkgithub || '';
    document.getElementById('editLinkVideoTutorial').value = tutorial.link_video || '';
    document.getElementById('editTagsTutorial').value = tutorial.tags || '';
    
    imagensMantidas = [...(tutorial.imagens_paths || [])];
    window.renderImagensExistentes();
    
    const inputEditNovo = document.getElementById('editImagensNovo');
    if (inputEditNovo) inputEditNovo.value = '';
    const previewNovoEditar = document.getElementById('previewNovasImagensTutorial');
    if (previewNovoEditar) previewNovoEditar.innerHTML = '';
    
    const feedback = document.getElementById('msgEditFeedbackTutorial');
    if (feedback) feedback.style.display = 'none';
    
    const btnAtualizar = document.getElementById('btnAtualizarTutorial');
    if (btnAtualizar) btnAtualizar.disabled = false;
    
    abrirModal('modalEditarTutorial');
};

window.renderImagensExistentes = function() {
    const container = document.getElementById('containerImagensExistentes');
    if (!container) return;
    container.innerHTML = '';
    
    imagensMantidas.forEach(imgPath => {
        container.innerHTML += `
            <div class="preview-container">
                <img src="http://localhost:3000${imgPath}">
                <button type="button" class="preview-delete-btn" onclick="removerImagemMantida('${imgPath}')">&times;</button>
            </div>
        `;
    });
};

window.removerImagemMantida = function(path) {
    imagensMantidas = imagensMantidas.filter(img => img !== path);
    window.renderImagensExistentes();
    window.validarQuantidadeImagensEditar();
};

window.validarQuantidadeImagensEditar = function() {
    const inputEdit = document.getElementById('editImagensNovo');
    const feedback = document.getElementById('msgEditFeedbackTutorial');
    const btnAtualizar = document.getElementById('btnAtualizarTutorial');
    
    const novasQty = inputEdit && inputEdit.files ? inputEdit.files.length : 0;
    const totalQty = imagensMantidas.length + novasQty;
    
    if (feedback) feedback.style.display = 'none';
    if (btnAtualizar) btnAtualizar.disabled = false;
    
    if (totalQty > 5) {
        if (feedback) {
            feedback.innerText = 'O total de imagens (mantidas + novas) não pode exceder 5.';
            feedback.style.color = '#d9534f';
            feedback.style.display = 'block';
        }
        if (btnAtualizar) btnAtualizar.disabled = true;
        return false;
    }
    return true;
};

const inputEditNovo = document.getElementById('editImagensNovo');
if (inputEditNovo) {
    inputEditNovo.addEventListener('change', function() {
        const preview = document.getElementById('previewNovasImagensTutorial');
        if (preview) preview.innerHTML = '';
        
        const isValid = window.validarQuantidadeImagensEditar();
        
        if (isValid && this.files) {
            Array.from(this.files).forEach(file => {
                const url = URL.createObjectURL(file);
                if (preview) {
                    preview.innerHTML += `<div class="preview-container"><img src="${url}"></div>`;
                }
            });
        } else if (!isValid) {
            this.value = '';
            if (preview) preview.innerHTML = '';
        }
    });
}

const formEditarTutorial = document.getElementById('formEditarTutorial');
if (formEditarTutorial) {
    formEditarTutorial.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = document.getElementById('editIdTutorial').value;
        const feedback = document.getElementById('msgEditFeedbackTutorial');
        const btnAtualizar = document.getElementById('btnAtualizarTutorial');
        
        if (!window.validarQuantidadeImagensEditar()) {
            return;
        }
        
        btnAtualizar.disabled = true;
        
        const formData = new FormData(this);
        formData.set('imagens_mantidas', JSON.stringify(imagensMantidas));
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`http://localhost:3000/api/tutoriais/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            if (!window.verificarStatusResponse(response)) return;

            if (response.ok) {
                feedback.innerText = 'Tutorial atualizado com sucesso!';
                feedback.style.color = '#28a745';
                feedback.style.display = 'block';
                carregarTutoriaisAdmin();
                setTimeout(() => { fecharModal('modalEditarTutorial'); }, 1500);
            } else {
                const data = await response.json();
                feedback.innerText = data.error || 'Erro ao atualizar o tutorial.';
                feedback.style.color = '#d9534f';
                feedback.style.display = 'block';
                btnAtualizar.disabled = false;
            }
        } catch (err) {
            feedback.innerText = 'Servidor indisponível.';
            feedback.style.color = '#d9534f';
            feedback.style.display = 'block';
            btnAtualizar.disabled = false;
        }
    });
}

window.excluirTutorial = function(id) {
    document.getElementById('idParaExcluirTutorial').value = id;
    abrirModal('modalConfirmacaoTutorial');
};

window.confirmarExclusaoTutorial = async function() {
    const id = document.getElementById('idParaExcluirTutorial').value;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:3000/api/tutoriais/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!window.verificarStatusResponse(response)) return;

        if (response.ok) {
            fecharModal('modalConfirmacaoTutorial');
            carregarTutoriaisAdmin();
        } else {
            alert('Erro ao excluir o tutorial.');
        }
    } catch (error) {
        console.error(error);
        alert('Servidor indisponível.');
    }
};

// --- GESTÃO DE PORTFÓLIO ---

async function carregarPortfolioAdmin() {
    const tbody = document.getElementById('corpoTabelaPortfolio');
    if (!tbody) return;

    try {
        const response = await fetch('http://localhost:3000/api/portfolio');
        if (!response.ok) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao ligar ao servidor.</td></tr>';
            return;
        }
        const portfolio = await response.json();
        portfolioCarregados = portfolio;
        tbody.innerHTML = ''; 
        
        if (portfolio.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum projeto cadastrado ainda.</td></tr>';
            return;
        }

        portfolio.forEach(projeto => {
            const miniaturaUrl = (projeto.imagens_paths && projeto.imagens_paths.length > 0)
                ? `http://localhost:3000${projeto.imagens_paths[0]}`
                : 'images/default-portfolio.jpg';

            const tagsBadges = projeto.tags 
                ? projeto.tags.split(',').map(t => `<span class="tag-badge">${t.trim()}</span>`).join('') 
                : '<em style="color:#aaa;">sem tags</em>';

            tbody.innerHTML += `
                <tr>
                    <td>
                        <div class="preview-container">
                            <img src="${miniaturaUrl}">
                        </div>
                    </td>
                    <td style="font-weight: 500;">${projeto.titulo}</td>
                    <td>${tagsBadges}</td>
                    <td>${projeto.autor}</td>
                    <td>${projeto.turma}</td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="editarPortfolio(${projeto.id})">Editar</button>
                        <button class="btn-sm btn-delete" onclick="excluirPortfolio(${projeto.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao ligar ao servidor.</td></tr>';
    }
}

const inputImagensPortfolio = document.getElementById('imagensPortfolio');
if (inputImagensPortfolio) {
    inputImagensPortfolio.addEventListener('change', function() {
        const preview = document.getElementById('previewImagensPortfolio');
        const feedback = document.getElementById('mensagemFeedbackPortfolio');
        const btnSalvar = document.getElementById('btnSalvarPortfolio');
        
        preview.innerHTML = '';
        feedback.style.display = 'none';
        btnSalvar.disabled = false;
        
        if (this.files.length > 5) {
            feedback.innerText = 'O máximo de imagens permitido é 5.';
            feedback.style.color = '#d9534f';
            feedback.style.display = 'block';
            btnSalvar.disabled = true;
            this.value = '';
            return;
        }
        
        Array.from(this.files).forEach(file => {
            const url = URL.createObjectURL(file);
            preview.innerHTML += `<div class="preview-container"><img src="${url}"></div>`;
        });
    });
}

const formPortfolio = document.getElementById('formPortfolio');
if (formPortfolio) {
    formPortfolio.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const feedback = document.getElementById('mensagemFeedbackPortfolio');
        const btnSalvar = document.getElementById('btnSalvarPortfolio');
        
        btnSalvar.disabled = true;
        
        const formData = new FormData(this);
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:3000/api/portfolio', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            if (!window.verificarStatusResponse(response)) return;

            if (response.ok) {
                feedback.innerText = 'Projeto criado com sucesso!';
                feedback.style.color = '#28a745';
                feedback.style.display = 'block';
                this.reset();
                const preview = document.getElementById('previewImagensPortfolio');
                if (preview) preview.innerHTML = '';
                carregarPortfolioAdmin();
                setTimeout(() => { fecharModal('modalPortfolio'); }, 1500);
            } else {
                const data = await response.json();
                feedback.innerText = data.erro || 'Erro ao criar o projeto.';
                feedback.style.color = '#d9534f';
                feedback.style.display = 'block';
                btnSalvar.disabled = false;
            }
        } catch (err) {
            feedback.innerText = 'Servidor indisponível.';
            feedback.style.color = '#d9534f';
            feedback.style.display = 'block';
            btnSalvar.disabled = false;
        }
    });
}

window.editarPortfolio = function(id) {
    const projeto = portfolioCarregados.find(p => p.id === id);
    if (!projeto) {
        alert('Projeto não encontrado.');
        return;
    }
    
    document.getElementById('editIdPortfolio').value = projeto.id;
    document.getElementById('editTituloPortfolio').value = projeto.titulo;
    document.getElementById('editAutorPortfolio').value = projeto.autor;
    document.getElementById('editTurmaPortfolio').value = projeto.turma;
    document.getElementById('editTagsPortfolio').value = projeto.tags || '';
    document.getElementById('editDescricaoPortfolio').value = projeto.descricao;
    document.getElementById('editConteudoPortfolio').value = projeto.conteudo;
    document.getElementById('editLinkgithubPortfolio').value = projeto.link_github || '';
    document.getElementById('editLinkVideoPortfolio').value = projeto.link_video || '';
    
    imagensMantidasPortfolio = [...(projeto.imagens_paths || [])];
    window.renderImagensExistentesPortfolio();
    
    const inputEditNovo = document.getElementById('editImagensNovoPortfolio');
    if (inputEditNovo) inputEditNovo.value = '';
    const previewNovoEditar = document.getElementById('previewNovasImagensPortfolio');
    if (previewNovoEditar) previewNovoEditar.innerHTML = '';
    
    const feedback = document.getElementById('msgEditFeedbackPortfolio');
    if (feedback) feedback.style.display = 'none';
    
    const btnAtualizar = document.getElementById('btnAtualizarPortfolio');
    if (btnAtualizar) btnAtualizar.disabled = false;
    
    abrirModal('modalEditarPortfolio');
};

window.renderImagensExistentesPortfolio = function() {
    const container = document.getElementById('containerImagensExistentesPortfolio');
    if (!container) return;
    container.innerHTML = '';
    
    imagensMantidasPortfolio.forEach(imgPath => {
        container.innerHTML += `
            <div class="preview-container">
                <img src="http://localhost:3000${imgPath}">
                <button type="button" class="preview-delete-btn" onclick="removerImagemMantidaPortfolio('${imgPath}')">&times;</button>
            </div>
        `;
    });
};

window.removerImagemMantidaPortfolio = function(path) {
    imagensMantidasPortfolio = imagensMantidasPortfolio.filter(img => img !== path);
    window.renderImagensExistentesPortfolio();
    window.validarQuantidadeImagensEditarPortfolio();
};

window.validarQuantidadeImagensEditarPortfolio = function() {
    const inputEdit = document.getElementById('editImagensNovoPortfolio');
    const feedback = document.getElementById('msgEditFeedbackPortfolio');
    const btnAtualizar = document.getElementById('btnAtualizarPortfolio');
    
    const novasQty = inputEdit && inputEdit.files ? inputEdit.files.length : 0;
    const totalQty = imagensMantidasPortfolio.length + novasQty;
    
    if (feedback) feedback.style.display = 'none';
    if (btnAtualizar) btnAtualizar.disabled = false;
    
    if (totalQty > 5) {
        if (feedback) {
            feedback.innerText = 'O total de imagens (mantidas + novas) não pode exceder 5.';
            feedback.style.color = '#d9534f';
            feedback.style.display = 'block';
        }
        if (btnAtualizar) btnAtualizar.disabled = true;
        return false;
    }
    return true;
};

const inputEditNovoPortfolio = document.getElementById('editImagensNovoPortfolio');
if (inputEditNovoPortfolio) {
    inputEditNovoPortfolio.addEventListener('change', function() {
        const preview = document.getElementById('previewNovasImagensPortfolio');
        if (preview) preview.innerHTML = '';
        
        const isValid = window.validarQuantidadeImagensEditarPortfolio();
        
        if (isValid && this.files) {
            Array.from(this.files).forEach(file => {
                const url = URL.createObjectURL(file);
                if (preview) {
                    preview.innerHTML += `<div class="preview-container"><img src="${url}"></div>`;
                }
            });
        } else if (!isValid) {
            this.value = '';
            if (preview) preview.innerHTML = '';
        }
    });
}

const formEditarPortfolio = document.getElementById('formEditarPortfolio');
if (formEditarPortfolio) {
    formEditarPortfolio.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = document.getElementById('editIdPortfolio').value;
        const feedback = document.getElementById('msgEditFeedbackPortfolio');
        const btnAtualizar = document.getElementById('btnAtualizarPortfolio');
        
        if (!window.validarQuantidadeImagensEditarPortfolio()) {
            return;
        }
        
        btnAtualizar.disabled = true;
        
        const formData = new FormData(this);
        formData.set('imagens_mantidas', JSON.stringify(imagensMantidasPortfolio));
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`http://localhost:3000/api/portfolio/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            if (!window.verificarStatusResponse(response)) return;

            if (response.ok) {
                feedback.innerText = 'Projeto atualizado com sucesso!';
                feedback.style.color = '#28a745';
                feedback.style.display = 'block';
                carregarPortfolioAdmin();
                setTimeout(() => { fecharModal('modalEditarPortfolio'); }, 1500);
            } else {
                const data = await response.json();
                feedback.innerText = data.erro || 'Erro ao atualizar o projeto.';
                feedback.style.color = '#d9534f';
                feedback.style.display = 'block';
                btnAtualizar.disabled = false;
            }
        } catch (err) {
            feedback.innerText = 'Servidor indisponível.';
            feedback.style.color = '#d9534f';
            feedback.style.display = 'block';
            btnAtualizar.disabled = false;
        }
    });
}

window.excluirPortfolio = function(id) {
    document.getElementById('idParaExcluirPortfolio').value = id;
    abrirModal('modalConfirmacaoPortfolio');
};

window.confirmarExclusaoPortfolio = async function() {
    const id = document.getElementById('idParaExcluirPortfolio').value;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:3000/api/portfolio/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!window.verificarStatusResponse(response)) return;

        if (response.ok) {
            fecharModal('modalConfirmacaoPortfolio');
            carregarPortfolioAdmin();
        } else {
            alert('Erro ao excluir o projeto.');
        }
    } catch (error) {
        console.error(error);
        alert('Servidor indisponível.');
    }
};

window.carregarPortfolioAdmin = carregarPortfolioAdmin;

// --- GESTÃO DE DESAFIOS ---

async function carregarDesafiosAdmin() {
    const tbody = document.getElementById('corpoTabelaDesafios');
    if (!tbody) return; 
    
    try {
        const response = await fetch('http://localhost:3000/api/desafios');
        const desafios = await response.json();
        tbody.innerHTML = ''; 
        
        if (desafios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhum desafio cadastrado ainda.</td></tr>';
            return;
        }

        desafios.forEach(desafio => {
            const dataFormatada = desafio.datalimite ? new Date(desafio.datalimite).toLocaleDateString('pt-BR') : 'A definir';
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 500;">${desafio.titulo}</td>
                    <td>${dataFormatada}</td>
                    <td>
                        <button class="btn-sm btn-info" onclick="verSolucoes(${desafio.id})">Ver Soluções</button>
                        <button class="btn-sm btn-edit" onclick="editarDesafio(${desafio.id})">Editar</button>
                        <button class="btn-sm btn-delete" onclick="excluirDesafio(${desafio.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Erro ao carregar dados.</td></tr>';
    }
}

const formDesafio = document.getElementById('formDesafio');
if (formDesafio) {
    formDesafio.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titulo = document.getElementById('tituloDesafio').value;
        const descricao = document.getElementById('descricaoDesafio').value;
        const datalimite = document.getElementById('dataLimiteDesafio').value;
        const msgFeedback = document.getElementById('mensagemFeedbackDesafio');

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3000/api/desafios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ titulo, descricao, datalimite })
            });

            if (!window.verificarStatusResponse(response)) return;

            if (response.ok) {
                msgFeedback.innerText = 'Desafio criado com sucesso!';
                msgFeedback.style.color = '#28a745';
                msgFeedback.style.display = 'block';
                document.getElementById('formDesafio').reset();
                carregarDesafiosAdmin();
                setTimeout(() => { fecharModal('modalDesafio'); }, 1500);
            } else {
                const err = await response.json();
                msgFeedback.innerText = err.erro || 'Erro ao criar o desafio.';
                msgFeedback.style.color = '#d9534f';
                msgFeedback.style.display = 'block';
            }
        } catch (err) {
            msgFeedback.innerText = 'Servidor indisponível.';
            msgFeedback.style.color = '#d9534f';
            msgFeedback.style.display = 'block';
        }
    });
}

window.editarDesafio = async function(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/desafios/${id}`);
        if (!response.ok) throw new Error('Desafio não encontrado');
        const desafio = await response.json();

        document.getElementById('editIdDesafio').value = desafio.id;
        document.getElementById('editTituloDesafio').value = desafio.titulo;
        document.getElementById('editDescricaoDesafio').value = desafio.descricao;
        
        if (desafio.datalimite) {
            let dataString = '';
            if (typeof desafio.datalimite === 'string') {
                dataString = desafio.datalimite.substring(0, 10);
            } else {
                const dateObj = new Date(desafio.datalimite);
                const ano = dateObj.getFullYear();
                const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dia = String(dateObj.getDate()).padStart(2, '0');
                dataString = `${ano}-${mes}-${dia}`;
            }
            document.getElementById('editDataLimiteDesafio').value = dataString;
        }

        abrirModal('modalEditarDesafio');
    } catch (error) {
        alert('Erro ao procurar os dados do desafio.');
    }
};

const formEditarDesafio = document.getElementById('formEditarDesafio');
if (formEditarDesafio) {
    formEditarDesafio.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editIdDesafio').value;
        const titulo = document.getElementById('editTituloDesafio').value;
        const descricao = document.getElementById('editDescricaoDesafio').value;
        const datalimite = document.getElementById('editDataLimiteDesafio').value;
        const msgFeedback = document.getElementById('msgEditFeedbackDesafio');

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/api/desafios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ titulo, descricao, datalimite })
            });

            if (!window.verificarStatusResponse(response)) return;

            if (response.ok) {
                msgFeedback.innerText = 'Desafio atualizado com sucesso!';
                msgFeedback.style.color = '#28a745';
                msgFeedback.style.display = 'block';
                carregarDesafiosAdmin();
                setTimeout(() => { fecharModal('modalEditarDesafio'); }, 1500);
            } else {
                msgFeedback.innerText = 'Erro ao atualizar. Verifica as permissões.';
                msgFeedback.style.color = '#d9534f';
                msgFeedback.style.display = 'block';
            }
        } catch (err) {
            msgFeedback.innerText = 'Servidor indisponível.';
            msgFeedback.style.color = '#d9534f';
            msgFeedback.style.display = 'block';
        }
    });
}

window.excluirDesafio = function(id) {
    document.getElementById('idParaExcluirDesafio').value = id;
    abrirModal('modalConfirmacaoDesafio');
};

window.confirmarExclusaoDesafio = async function() {
    const id = document.getElementById('idParaExcluirDesafio').value;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:3000/api/desafios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!window.verificarStatusResponse(response)) return;

        if (response.ok) {
            fecharModal('modalConfirmacaoDesafio');
            carregarDesafiosAdmin();
        } else {
            alert("Erro ao excluir o desafio.");
        }
    } catch (error) {
        console.error(error);
        alert("Servidor indisponível.");
    }
};

window.verSolucoes = async function(desafioId) {
    const tbody = document.getElementById('corpoTabelaSolucoes');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">A carregar soluções...</td></tr>';
    abrirModal('modalVerSolucoes');
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:3000/api/desafios/${desafioId}/solucoes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Erro ao buscar soluções');
        
        const solucoes = await response.json();
        tbody.innerHTML = '';
        
        if (solucoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhuma solução submetida para este desafio.</td></tr>';
            return;
        }

        solucoes.forEach(sol => {
            const dataSub = new Date(sol.enviado_em).toLocaleString('pt-BR');
            let linkGithubStr = sol.link_github ? `<a href="${sol.link_github}" target="_blank" style="color:var(--primary);">GitHub</a>` : '';
            let arquivoStr = sol.arquivo_path ? `<a href="http://localhost:3000/api/desafios/solucoes/download/${sol.arquivo_path.split(/[\/\\]/).pop()}" target="_blank" style="color:#ef4444; margin-left: 10px;">Baixar Arquivo</a>` : '';
            
            tbody.innerHTML += `
                <tr>
                    <td><strong>${sol.nome}</strong><br><small>${sol.email}</small></td>
                    <td>${dataSub}</td>
                    <td>${linkGithubStr} ${arquivoStr}</td>
                    <td>
                        <span style="font-weight:600; color:${sol.status === 'Em Avaliação' ? 'orange' : (sol.status === 'Aprovado' ? 'green' : 'red')}">${sol.status}</span><br>
                        Nota: ${sol.nota || '-'}
                    </td>
                    <td>
                        <div style="display:flex; flex-direction:column; gap:5px;">
                            <input type="number" id="nota_${sol.id}" value="${sol.nota || ''}" min="0" max="10" step="0.1" class="admin-input" style="padding:4px; font-size:12px; margin:0;" placeholder="Nota">
                            <select id="status_${sol.id}" class="admin-input" style="padding:4px; font-size:12px; margin:0;">
                                <option value="Em Avaliação" ${sol.status === 'Em Avaliação' ? 'selected' : ''}>Em Avaliação</option>
                                <option value="Aprovado" ${sol.status === 'Aprovado' ? 'selected' : ''}>Aprovado</option>
                                <option value="Reprovado" ${sol.status === 'Reprovado' ? 'selected' : ''}>Reprovado</option>
                            </select>
                            <button class="btn-sm btn-primary" onclick="salvarNotaSolucao(${sol.id}, ${desafioId})">Salvar</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Erro ao carregar soluções.</td></tr>';
    }
};

window.salvarNotaSolucao = async function(solucaoId, desafioId) {
    const nota = document.getElementById(`nota_${solucaoId}`).value;
    const status = document.getElementById(`status_${solucaoId}`).value;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:3000/api/desafios/solucoes/${solucaoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nota, status })
        });
        
        if (!window.verificarStatusResponse(response)) return;
        
        if (response.ok) {
            alert('Avaliação salva com sucesso!');
            verSolucoes(desafioId); // recarregar
        } else {
            const err = await response.json();
            alert(`Erro: ${err.erro}`);
        }
    } catch (err) {
        alert('Servidor indisponível.');
    }
};