let tutoriaisCarregados = [];
let imagensMantidas = [];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('usuario');

    if (!token || !userStr) {
        window.location.href = 'login.html'; 
        return;
    }
    const user = JSON.parse(userStr);
    if (user.tipo !== 'COORDENADOR' && user.tipo !== 'ORIENTADOR' && user.tipo !== 'ADMIN') {
        window.location.href = 'login.html'; 
        return;
    }

    carregarCursosAdmin();
    carregarVagasAdmin();
    carregarTutoriaisAdmin();

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
    
    const msgTutorial = document.getElementById(idModal === 'modalTutorial' ? 'mensagemFeedbackTutorial' : 'msgEditFeedbackTutorial');
    if (msgTutorial) msgTutorial.style.display = 'none';

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
    try {
        const response = await fetch('http://localhost:3000/api/cursos');
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
            document.getElementById('formInscricaoManual').style.display = 'none';
            atualizarTabelaInscritos(cursoId);
        } else {
            alert('Falha ao registrar inscrição.');
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
            fecharModal('modalEditarInscrito');
            atualizarTabelaInscritos(cursoId);
        } else {
            alert('Erro ao atualizar os dados do aluno.');
        }
    } catch (error) {
        alert('Servidor indisponível.');
    }
});

// --- GESTÃO DE VAGAS ---

// Listar Vagas
async function carregarVagasAdmin() {
    const tbody = document.getElementById('corpoTabelaVagas');
    // Verificamos se o elemento existe na tela antes de continuar
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

// Submeter Nova Vaga
const formVaga = document.getElementById('formVaga');
if(formVaga) {
    formVaga.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titulo = document.getElementById('tituloVaga').value;
        const descricao = document.getElementById('descricaoVaga').value;
        const datalimite = document.getElementById('dataLimiteVaga').value;
        const msgFeedback = document.getElementById('mensagemFeedbackVaga');

        // Validação de data no passado
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

// Abrir modal de edição com os dados da vaga
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

// Submeter Edição da Vaga
const formEditarVaga = document.getElementById('formEditarVaga');
if(formEditarVaga) {
    formEditarVaga.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editIdVaga').value;
        const titulo = document.getElementById('editTituloVaga').value;
        const descricao = document.getElementById('editDescricaoVaga').value;
        const datalimite = document.getElementById('editDataLimiteVaga').value;
        const msgFeedback = document.getElementById('msgEditFeedbackVaga');

        // Validação de data no passado
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

// Excluir Vaga
window.excluirVaga = function(id) {
    document.getElementById('idParaExcluirVaga').value = id;
    abrirModal('modalConfirmacaoVaga');
};

// Confirmar exclusão no servidor
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

// Listar Tutoriais
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

// Validar imagens no modal de criação
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

// Submeter Novo Tutorial
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

// Abrir modal de edição com os dados do tutorial
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

// Renderizar imagens que já foram salvas anteriormente
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

// Remover uma das imagens mantidas
window.removerImagemMantida = function(path) {
    imagensMantidas = imagensMantidas.filter(img => img !== path);
    window.renderImagensExistentes();
    window.validarQuantidadeImagensEditar();
};

// Validar quantidade total de imagens na edição (mantidas + novas)
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

// Evento change do input de novas imagens na edição
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

// Submeter Edição do Tutorial
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

// Excluir Tutorial
window.excluirTutorial = function(id) {
    document.getElementById('idParaExcluirTutorial').value = id;
    abrirModal('modalConfirmacaoTutorial');
};

// Confirmar exclusão do tutorial
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