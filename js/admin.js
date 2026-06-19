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

    // Carregar todas as abas iniciais
    carregarCursosAdmin();
    carregarVagasAdmin();
    carregarTutoriaisAdmin();
    carregarBibliotecaAdmin();
    carregarPortfolioAdmin();

    const hojeStr = new Date().toISOString().split('T')[0];
    const inputData = document.getElementById('dataLimiteVaga');
    if (inputData) inputData.min = hojeStr;
    const inputEditData = document.getElementById('editDataLimiteVaga');
    if (inputEditData) inputEditData.min = hojeStr;
});

// --- FUNÇÕES DE INTERFACE GERAL ---
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

window.verificarStatusResponse = function(response) {
    if (response.status === 401 || response.status === 403) {
        alert('Sua sessão expirou ou é inválida. Por favor, inicie sessão novamente.');
        window.logout();
        return false;
    }
    return true;
};

// ============================================================================
// --- GESTÃO DE CURSOS ---
// ============================================================================

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
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Erro na resposta do servidor.</td></tr>';
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
                        <button class="btn-sm btn-info" onclick="gerenciarInscritos(${curso.id}, '${curso.titulo.replace(/'/g, "\\'")}')">👥 Inscritos</button>
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

window.salvarNovoCurso = async function() {
    const form = document.getElementById('formCurso');
    if (!form.reportValidity()) return;

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
            form.reset();
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
};

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

window.salvarEdicaoCurso = async function() {
    const form = document.getElementById('formEditarCurso');
    if (!form.reportValidity()) return;

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
};

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

// ============================================================================
// --- GESTÃO DE ALUNOS INSCRITOS ---
// ============================================================================

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
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Acesso negado');

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

window.salvarInscricaoManual = async function() {
    const form = document.getElementById('formInscricaoManual');
    if (!form.reportValidity()) return;

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
            form.reset();
            form.style.display = 'none';
            atualizarTabelaInscritos(cursoId);
        } else {
            const erroData = await response.json();
            alert(`⚠️ Atenção: ${erroData.erro}`);
        }
    } catch (error) {
        alert('Servidor fora do ar.');
    }
};

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

window.salvarEdicaoInscrito = async function() {
    const form = document.getElementById('formEditarInscrito');
    if (!form.reportValidity()) return;

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
            const erroData = await response.json();
            alert(`⚠️ Atenção: ${erroData.erro}`);
        }
    } catch (error) {
        alert('Servidor indisponível.');
    }
};

// ============================================================================
// --- GESTÃO DE VAGAS ---
// ============================================================================

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
                        <button class="btn-sm btn-info" onclick="gerenciarCandidatos(${vaga.id}, '${vaga.titulo.replace(/'/g, "\\'")}')">👥 Candidatos</button>
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

window.salvarNovaVaga = async function() {
    const form = document.getElementById('formVaga');
    if (!form.reportValidity()) return;

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
            form.reset();
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
};

window.editarVaga = async function(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/vagas/${id}`);
        if (!response.ok) throw new Error('Vaga não encontrada');
        const vaga = await response.json();

        document.getElementById('editIdVaga').value = vaga.id;
        document.getElementById('editTituloVaga').value = vaga.titulo;
        document.getElementById('editDescricaoVaga').value = vaga.descricao;
        
        if (vaga.datalimite) {
            let dataString = typeof vaga.datalimite === 'string' ? vaga.datalimite.substring(0, 10) : '';
            if (!dataString) {
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

window.salvarEdicaoVaga = async function() {
    const form = document.getElementById('formEditarVaga');
    if (!form.reportValidity()) return;

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
};

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
        alert("Servidor indisponível.");
    }
};

// ============================================================================
// --- GESTÃO DE TUTORIAIS ---
// ============================================================================

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

window.salvarNovoTutorial = async function() {
    const form = document.getElementById('formTutorial');
    if (!form.reportValidity()) return;

    const feedback = document.getElementById('mensagemFeedbackTutorial');
    const btnSalvar = document.getElementById('btnSalvarTutorial');
    btnSalvar.disabled = true;
    
    const formData = new FormData(form);
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
            form.reset();
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
};

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

window.salvarEdicaoTutorial = async function() {
    const form = document.getElementById('formEditarTutorial');
    if (!form.reportValidity()) return;

    const id = document.getElementById('editIdTutorial').value;
    const feedback = document.getElementById('msgEditFeedbackTutorial');
    const btnAtualizar = document.getElementById('btnAtualizarTutorial');
    
    if (!window.validarQuantidadeImagensEditar()) return;
    btnAtualizar.disabled = true;
    
    const formData = new FormData(form);
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
};

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
        alert('Servidor indisponível.');
    }
};

// ============================================================================
// --- CRUD BIBLIOTECA (Materiais) ---
// ============================================================================

async function carregarBibliotecaAdmin() {
    const tbody = document.getElementById('corpoTabelaBiblioteca');
    if (!tbody) return;
    try {
        const response = await fetch('http://localhost:3000/api/materiais');
        const materiais = await response.json();
        tbody.innerHTML = '';

        if (materiais.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhum material cadastrado ainda.</td></tr>';
            return;
        }

        materiais.forEach(mat => {
            tbody.innerHTML += `
                <tr>
                    <td>${mat.titulo}</td>
                    <td>${mat.categoria}</td>
                    <td>${mat.tipo}</td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="editarBiblioteca(${mat.id}, '${mat.titulo.replace(/'/g, "\\'")}', '${mat.categoria}', '${mat.tipo}', '${mat.link}')">Editar</button>
                        <button class="btn-sm btn-delete" onclick="abrirConfirmacaoBiblioteca(${mat.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar dados da biblioteca.</td></tr>';
    }
}

window.abrirModalBiblioteca = function() {
    document.getElementById('formBiblioteca').reset();
    document.getElementById('bibId').value = '';
    document.getElementById('tituloModalBiblioteca').innerText = 'Novo Material';
    abrirModal('modalBiblioteca');
};

window.editarBiblioteca = function(id, titulo, categoria, tipo, link) {
    document.getElementById('bibId').value = id;
    document.getElementById('bibTitulo').value = titulo;
    document.getElementById('bibCategoria').value = categoria;
    document.getElementById('bibTipo').value = tipo;
    document.getElementById('bibLink').value = link;
    document.getElementById('tituloModalBiblioteca').innerText = 'Editar Material';
    abrirModal('modalBiblioteca');
};

window.salvarBiblioteca = async function() {
    const form = document.getElementById('formBiblioteca');
    if (!form.reportValidity()) return;

    const id = document.getElementById('bibId').value;
    const dados = {
        titulo: document.getElementById('bibTitulo').value,
        categoria: document.getElementById('bibCategoria').value,
        tipo: document.getElementById('bibTipo').value,
        link: document.getElementById('bibLink').value
    };

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:3000/api/materiais/${id}` : 'http://localhost:3000/api/materiais';
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(dados)
        });

        if (!window.verificarStatusResponse(response)) return;

        if (response.ok) {
            fecharModal('modalBiblioteca');
            carregarBibliotecaAdmin();
        } else {
            alert('Erro ao salvar material.');
        }
    } catch (error) {
        alert('Servidor indisponível.');
    }
};

window.abrirConfirmacaoBiblioteca = function(id) {
    document.getElementById('idParaExcluirBiblioteca').value = id;
    abrirModal('modalConfirmacaoBiblioteca');
};

window.confirmarExclusaoBiblioteca = async function() {
    const id = document.getElementById('idParaExcluirBiblioteca').value;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/api/materiais/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!window.verificarStatusResponse(response)) return;
        fecharModal('modalConfirmacaoBiblioteca');
        carregarBibliotecaAdmin();
    } catch (error) {
        alert('Servidor indisponível.');
    }
};

// ============================================================================
// --- CRUD PORTFÓLIO ---
// ============================================================================

async function carregarPortfolioAdmin() {
    const tbody = document.getElementById('corpoTabelaPortfolio');
    if (!tbody) return;
    try {
        const response = await fetch('http://localhost:3000/api/portfolio');
        const projetos = await response.json();
        tbody.innerHTML = '';

        if (projetos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhum projeto cadastrado ainda.</td></tr>';
            return;
        }

        projetos.forEach(proj => {
            tbody.innerHTML += `
                <tr>
                    <td>${proj.titulo}</td>
                    <td>${proj.autor}</td>
                    <td><a href="${proj.link_github}" target="_blank">Acessar Repo</a></td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="editarPortfolio(${proj.id}, '${proj.titulo.replace(/'/g, "\\'")}', '${proj.autor.replace(/'/g, "\\'")}', '${proj.descricao.replace(/'/g, "\\'")}', '${proj.link_github}')">Editar</button>
                        <button class="btn-sm btn-delete" onclick="abrirConfirmacaoPortfolio(${proj.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar projetos do portfólio.</td></tr>';
    }
}

window.abrirModalPortfolio = function() {
    document.getElementById('formPortfolio').reset();
    document.getElementById('portId').value = '';
    document.getElementById('tituloModalPortfolio').innerText = 'Novo Projeto';
    abrirModal('modalPortfolio');
};

window.editarPortfolio = function(id, titulo, autor, descricao, link_github) {
    document.getElementById('portId').value = id;
    document.getElementById('portTitulo').value = titulo;
    document.getElementById('portAutor').value = autor;
    document.getElementById('portDescricao').value = descricao;
    document.getElementById('portLink').value = link_github;
    document.getElementById('tituloModalPortfolio').innerText = 'Editar Projeto';
    abrirModal('modalPortfolio');
};

window.salvarPortfolio = async function() {
    const form = document.getElementById('formPortfolio');
    if (!form.reportValidity()) return;

    const id = document.getElementById('portId').value;
    const dados = {
        titulo: document.getElementById('portTitulo').value,
        autor: document.getElementById('portAutor').value,
        descricao: document.getElementById('portDescricao').value,
        link_github: document.getElementById('portLink').value
    };

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:3000/api/portfolio/${id}` : 'http://localhost:3000/api/portfolio';
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(dados)
        });

        if (!window.verificarStatusResponse(response)) return;

        if (response.ok) {
            fecharModal('modalPortfolio');
            carregarPortfolioAdmin();
        } else {
            alert('Erro ao salvar projeto.');
        }
    } catch (error) {
        alert('Servidor indisponível.');
    }
};

window.abrirConfirmacaoPortfolio = function(id) {
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
        fecharModal('modalConfirmacaoPortfolio');
        carregarPortfolioAdmin();
    } catch (error) {
        alert('Servidor indisponível.');
    }
};

// ============================================================================
// --- GESTÃO DE CANDIDATOS (Vagas) ---
// ============================================================================

window.gerenciarCandidatos = async function(vagaId, tituloVaga) {
    document.getElementById('tituloModalCandidatos').innerText = `Candidatos à Vaga: ${tituloVaga}`;
    const tbody = document.getElementById('corpoTabelaCandidatos');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">A procurar candidatos...</td></tr>';
    
    abrirModal('modalCandidatos');

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/api/vagas/${vagaId}/candidaturas-admin`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Falha ao carregar');

        const candidatos = await response.json();
        tbody.innerHTML = '';

        if (candidatos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Ninguém se candidatou a esta vaga ainda.</td></tr>';
            return;
        }

        candidatos.forEach(cand => {
            let linkLinkedin = cand.linkedin ? `<a href="${cand.linkedin}" target="_blank" style="color: #007bff; text-decoration: underline;">Ver Perfil</a>` : '-';
            
            // Corrige as barras no caminho do arquivo para o navegador conseguir ler
            let caminhoPDF = cand.curriculo_path ? cand.curriculo_path.replace(/\\/g, '/') : '';
            let btnCurriculo = caminhoPDF ? `<a href="http://localhost:3000/uploads/${caminhoPDF}" target="_blank" class="btn-sm btn-info" style="text-decoration:none; display:inline-block;">Ver PDF</a>` : 'Sem anexo';

            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 500;">${cand.nome}</td>
                    <td>${cand.curso}</td>
                    <td>${cand.email}</td>
                    <td>${cand.telefone}</td>
                    <td>${linkLinkedin}</td>
                    <td>${btnCurriculo}</td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar dados.</td></tr>';
    }
};