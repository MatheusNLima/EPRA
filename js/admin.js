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
    const msg = document.getElementById(idModal === 'modalCurso' ? 'mensagemFeedback' : 'msgEditFeedback');
    if (msg) msg.style.display = 'none';
};

window.fecharModal = function(idModal) {
    document.getElementById(idModal).style.display = 'none';
    const form = document.querySelector(`#${idModal} form`);
    if(form) form.reset();
};

window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
};

// --- GESTÃO DE CURSOS ---

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
        // Corrigido para /api/cursos/ (plural)
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
        // Corrigido para /api/cursos/ (plural)
        const response = await fetch(`http://localhost:3000/api/cursos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(cursoAtualizado)
        });

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
        // Corrigido para /api/cursos/ (plural)
        const response = await fetch(`http://localhost:3000/api/cursos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

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
                    <td>${btnTermo}</td> <td>
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