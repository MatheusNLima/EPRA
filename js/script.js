document.addEventListener('DOMContentLoaded', () => {

    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // --- MÁSCARA PARA O CPF AUTOMÁTICA ---
    const inputCpf = document.getElementById('inscDocumento');
    if (inputCpf) {
        inputCpf.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
            e.target.value = !x[2] ? x[1] : x[1] + '.' + x[2] + (x[3] ? '.' + x[3] : '') + (x[4] ? '-' + x[4] : '');
        });
    }

    const inputTelefone = document.getElementById('inscTelefone');
    if (inputTelefone) {
        inputTelefone.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }

    const inputTelefoneCand = document.getElementById('candidaturaTelefone');
    if (inputTelefoneCand) {
        inputTelefoneCand.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }

    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('usuario');
        const loginLink = document.getElementById('loginLink');
        const adminLink = document.getElementById('adminLink');
        const logoutLink = document.getElementById('logoutLink');

        if (token && userStr) {
            const user = JSON.parse(userStr);
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'block';
            if (adminLink) adminLink.style.display = (user.tipo === 'ORIENTADOR') ? 'block' : 'none';
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (adminLink) adminLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'none';
        }
    }

    const pendingId = localStorage.getItem('pendingCandidacyVagaId');
    const pendingTitulo = localStorage.getItem('pendingCandidacyVagaTitulo');
    const token = localStorage.getItem('token');
    if (token && pendingId && pendingTitulo) {
        localStorage.removeItem('pendingCandidacyVagaId');
        localStorage.removeItem('pendingCandidacyVagaTitulo');
        setTimeout(() => {
            window.abrirModalCandidatura(pendingId, pendingTitulo);
        }, 200);
    }

    window.logout = function() {
        localStorage.clear();
        window.location.href = 'index.html';
    };

    window.verificarAcao = function(callback) {
        if (localStorage.getItem('token')) {
            callback();
        } else {
            document.getElementById('modalLogin').style.display = 'flex';
        }
    };

    window.fecharModal = function() {
        document.getElementById('modalLogin').style.display = 'none';
    };

    function setupFilter(buttonClass, itemClass) {
        const buttons = document.querySelectorAll(buttonClass);
        const items = document.querySelectorAll(itemClass);

        if (buttons.length === 0 || items.length === 0) return;

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                items.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');
                    if (filterValue === 'all' || filterValue === itemCategory) {
                        item.classList.remove('hidden');
                        item.style.opacity = '0';
                        setTimeout(() => item.style.opacity = '1', 50);
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

    async function carregarCursos() {
        try {
            const response = await fetch('http://localhost:3000/api/cursos');
            const cursos = await response.json();
            const containerDinamico = document.getElementById('cursos-container');
            if(containerDinamico) containerDinamico.innerHTML = '';

            if (cursos.length === 0 && containerDinamico) {
                containerDinamico.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1; padding: 20px;">Nenhum curso com inscrições abertas no momento.</p>';
                return;
            }

            let htmlCursos = '';
            cursos.forEach(curso => {
                const dataFormatada = curso.datainicio ? new Date(curso.datainicio).toLocaleDateString('pt-BR') : 'A definir';
                
                let statusBandeira = `<span class="status-green">Inscrições Abertas</span>`;
                let vagasInfo = `<span class="slots">${curso.vagas} vagas disponíveis</span>`;
                
                // Envia o título do curso para guardar no pop-up
                const tituloSeguro = curso.titulo.replace(/'/g, "\\'");
                let botaoAcao = `<button class="btn btn-dark" style="flex: 1;" onclick="abrirFormularioInscricao(${curso.id}, '${tituloSeguro}')">Inscrever-se</button>`;

                if (curso.vagas <= 0) {
                    statusBandeira = `<span class="status-green" style="background-color: #d9534f;">Turma Cheia</span>`;
                    vagasInfo = `<span class="slots" style="color: #d9534f; font-weight: bold;">Esgotado</span>`;
                    botaoAcao = `<button class="btn btn-dark" style="flex: 1; background: #666; cursor: not-allowed;" disabled>Sem Vagas</button>`;
                }

                htmlCursos += `
                    <div class="course-card" data-category="proximos">
                        <div class="course-header">
                            ${statusBandeira}
                            ${vagasInfo}
                        </div>
                        <h3>${curso.titulo}</h3>
                        <p>${curso.descricao}</p>
                        <ul class="course-info">
                            <li>📅 Início: ${dataFormatada}</li>
                        </ul>
                        <div style="margin-top: 20px; display: flex; gap: 10px;">
                            ${botaoAcao}
                            <button class="btn btn-outline">Mais Detalhes</button>
                        </div>
                    </div>
                `;
            });

            if(containerDinamico) {
                containerDinamico.innerHTML = htmlCursos;
            }

            setupFilter('.filter-courses .tab-pill', '.courses-grid .course-card');
        } catch (error) { console.error(error); }
    }

    async function carregarVagas() {
        try {
            const response = await fetch('http://localhost:3000/api/vagas');
            const vagas = await response.json();
            const grid = document.querySelector('#oportunidades .grid-3');
            if (!grid) return;
            
            grid.innerHTML = '';
            vagas.forEach(vaga => {
                const prazo = vaga.datalimite ? new Date(vaga.datalimite).toLocaleDateString('pt-BR') : 'Sem prazo definido';
                grid.innerHTML += `
                    <div class="job-card">
                        <div class="job-card-inner">
                            <div class="job-top">
                                <span class="job-badge internship">Oportunidade</span>
                                <span class="job-location">📍 EPRA</span>
                            </div>
                            <h3>${vaga.titulo}</h3>
                            <p class="job-desc">${vaga.descricao}</p>
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #666; margin-bottom: 15px; margin-top: 15px;">
                                <span>📅 Prazo: ${prazo}</span>
                            </div>
                            <button class="btn btn-outline full-width mt-auto" onclick="abrirModalCandidatura(${vaga.id}, '${vaga.titulo}')">Candidatar-se</button>
                        </div>
                    </div>
                `;
            });
        } catch (error) { console.error(error); }
    }

    async function carregarMateriais() {
        try {
            const response = await fetch('http://localhost:3000/api/materiais');
            const materiais = await response.json();
            const grid = document.querySelector('.library-grid');
            if (!grid) return;
            
            grid.innerHTML = '';
            materiais.forEach(mat => {
                grid.innerHTML += `
                    <div class="lib-card" data-category="materiais">
                        <div class="lib-icon">📁</div>
                        <h3 style="margin-top: 10px;">${mat.titulo}</h3>
                        <span class="lib-meta" style="color: #666; font-size: 0.9rem;">Formato: ${mat.tipo}</span>
                        <div style="margin-top: 15px;">
                            <a href="${mat.link}" target="_blank" class="btn btn-dark">📥 Baixar Arquivo</a>
                        </div>
                    </div>
                `;
            });
            setupFilter('.filter-library .tab-pill', '.library-grid .lib-card');
        } catch (error) { console.error(error); }
    }

    async function carregarTutoriaisHome() {
        const grid = document.getElementById('containerTutoriais');
        if (!grid) return;

        try {
            const response = await fetch('http://localhost:3000/api/tutoriais');
            if (!response.ok) throw new Error('Erro na resposta');
            const tutoriais = await response.json();

            if (tutoriais.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px;">
                        <h3 style="margin-bottom: 10px; color: #333;">Nenhum tutorial encontrado</h3>
                    </div>
                `;
                return;
            }

            grid.innerHTML = '';
            tutoriais.forEach(tut => {
                let imgSrc = 'images/default-tutorial.jpg';
                if (tut.imagens_paths && tut.imagens_paths.length > 0) {
                    imgSrc = `http://localhost:3000${tut.imagens_paths[0]}`;
                }

                const tagsList = tut.tags ? tut.tags.split(',') : [];
                const tagsHtml = tagsList
                    .map(tag => `<span class="tag" style="margin-right: 8px;">${tag.trim()}</span>`)
                    .join('');

                grid.innerHTML += `
                    <div class="card">
                        <img src="${imgSrc}" alt="${tut.titulo}" class="card-img">
                        <div class="card-body">
                            <div style="margin-bottom: 10px;">${tagsHtml}</div>
                            <h4>${tut.titulo}</h4>
                            <p>${tut.descricao || (tut.conteudo.length > 100 ? tut.conteudo.substring(0, 100) + '...' : tut.conteudo)}</p>
                            <a href="tutorial.html?id=${tut.id}" class="link-arrow">Acessar Tutorial <span aria-hidden="true">&gt;</span></a>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    async function carregarPortfolio() {
        try {
            const response = await fetch('http://localhost:3000/api/portfolio');
            const portfolio = await response.json();
            const grid = document.querySelector('#portfolio .grid-3');
            if (!grid) return;

            grid.innerHTML = '';
            portfolio.forEach(item => {
                grid.innerHTML += `
                    <div class="portfolio-card" style="padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <span class="media-badge" style="font-weight: bold; color: #0056b3;">Projeto</span>
                        <h3 style="margin-top: 10px;">${item.titulo}</h3>
                        <p style="margin-top: 5px; color: #666; font-size: 0.9rem;">Autor: ${item.autor}</p>
                        <a href="${item.link_github}" target="_blank" class="btn btn-outline" style="margin-top: 15px;">Acessar Repositório</a>
                    </div>
                `;
            });
        } catch (error) { console.error(error); }
    }

    async function carregarImpacto() {
        try {
            const response = await fetch('http://localhost:3000/api/impacto');
            const metricas = await response.json();
            
            const elEscolas = document.getElementById('num-escolas');
            const elAlunos = document.getElementById('num-alunos');
            const elHoras = document.getElementById('num-horas');

            metricas.forEach(metrica => {
                if (metrica.descricao === 'Total de Inscritos' && elAlunos) elAlunos.innerText = metrica.valor;
                if (metrica.descricao === 'Certificados Emitidos' && elHoras) elHoras.innerText = metrica.valor;
            });
            if (elEscolas && elEscolas.innerText === 'Y') elEscolas.innerText = '12';
        } catch (error) { console.error(error); }
    }

    window.atualizarVisualizacaoCursos = carregarCursos;
    carregarCursos();
    carregarVagas();
    carregarMateriais();
    carregarTutoriaisHome();
    carregarPortfolio();
    carregarImpacto();

}); // FIM DO DOMContentLoaded


// ============================================================================
// --- FUNÇÕES GLOBAIS DE INTERAÇÃO DOS MODAIS ---
// ============================================================================

window.abrirFormularioInscricao = function(idCurso, tituloCurso) {
    document.getElementById('inscricaoCursoId').value = idCurso;
    document.getElementById('inscricaoCursoTitulo').value = tituloCurso || '';
    document.getElementById('modalInscricaoPublica').style.display = 'flex';
};

window.fecharModalInscricao = function() {
    document.getElementById('modalInscricaoPublica').style.display = 'none';
    const form = document.getElementById('formInscricaoPublica');
    if(form) form.reset();
};

window.abrirModalCandidatura = function(id, titulo) {
    const userToken = localStorage.getItem('token');
    if (!userToken) {
        localStorage.setItem('pendingCandidacyVagaId', id);
        localStorage.setItem('pendingCandidacyVagaTitulo', titulo);
        document.getElementById('modalLogin').style.display = 'flex';
        return;
    }

    document.getElementById('candidaturaVagaId').value = id;
    document.getElementById('candidaturaVagaTitulo').value = titulo;
    document.getElementById('candidaturaNome').value = '';
    document.getElementById('candidaturaEmail').value = '';
    document.getElementById('candidaturaCurso').value = '';
    document.getElementById('candidaturaTelefone').value = '';
    document.getElementById('candidaturaLinkedin').value = '';
    document.getElementById('candidaturaCurriculo').value = '';
    document.getElementById('modalCandidaturaVaga').style.display = 'flex';
};

window.fecharModalCandidatura = function() {
    document.getElementById('modalCandidaturaVaga').style.display = 'none';
    const form = document.getElementById('formCandidaturaVaga');
    if(form) form.reset();
};

window.fecharModalAviso = function() {
    document.getElementById('modalAviso').style.display = 'none';
};

window.mostrarAviso = function(titulo, texto, corTitulo = '#0056b3') {
    const elTitulo = document.getElementById('tituloAviso');
    elTitulo.innerText = titulo;
    elTitulo.style.color = corTitulo;
    document.getElementById('textoAviso').innerText = texto;
    document.getElementById('modalAviso').style.display = 'flex';
};

// ============================================================================
// --- LÓGICA DE SUBMISSÃO (ÚNICA, CEGA E BLINDADA) ---
// ============================================================================

window.enviarInscricaoPublica = async function() {
    const form = document.getElementById('formInscricaoPublica');
    
    // Força o navegador a verificar os campos "required" sem usar o submit nativo
    if (!form.reportValidity()) {
        return; 
    }

    const btnSubmit = document.getElementById('btnEnviarInscricao');
    const textoOriginal = btnSubmit.innerText;
    
    btnSubmit.innerText = 'A enviar...';
    btnSubmit.disabled = true;

    // Recupera o título do curso
    const tituloCurso = document.getElementById('inscricaoCursoTitulo').value || 'selecionado';

    const formData = new FormData();
    formData.append('curso_id', document.getElementById('inscricaoCursoId').value);
    formData.append('nome', document.getElementById('inscNome').value);
    formData.append('documento', document.getElementById('inscDocumento').value);
    formData.append('email', document.getElementById('inscEmail').value);
    formData.append('telefone', document.getElementById('inscTelefone').value);
    
    const progSelecionado = document.querySelector('input[name="conhecimentoProg"]:checked');
    if (progSelecionado) formData.append('conhecimento_programacao', progSelecionado.value);
    
    const robSelecionado = document.querySelector('input[name="conhecimentoRob"]:checked');
    if (robSelecionado) formData.append('conhecimento_robotica', robSelecionado.value);
    
    formData.append('instituicao_ensino', document.getElementById('inscInstituicao').value);
    
    const inputArquivo = document.getElementById('inscTermo');
    if (inputArquivo && inputArquivo.files.length > 0) {
        formData.append('termo_consentimento', inputArquivo.files[0]);
    }

    try {
        const response = await fetch('http://localhost:3000/api/inscricoes/publica', {
            method: 'POST',
            body: formData
        });

        const responseData = await response.json();

        if (response.ok || response.status === 201) {
            // SUCESSO: A ficha de inscrição FECHA e o aviso Verde surge!
            window.fecharModalInscricao(); 
            window.mostrarAviso('Sucesso!', `Inscrição no curso ${tituloCurso} concluída! Verifique seu email em breve, entraremos em contato.`, '#28a745');
            if (window.atualizarVisualizacaoCursos) window.atualizarVisualizacaoCursos();
        } else {
            // ERRO (DUPLICADO): A ficha FICA ABERTA e o aviso Vermelho surge por cima!
            if (responseData.erro === 'DUPLICADO') {
                window.mostrarAviso('Atenção!', `Esse CPF já está inscrito no curso ${tituloCurso}. Verifique seu email e aguarde atualizações. Caso não tenha feito essa inscrição, entre em contato com os nossos coordenadores.`, '#d9534f');
            } else {
                window.mostrarAviso('Atenção!', responseData.erro || 'Erro na inscrição.', '#d9534f');
            }
        }

    } catch (error) {
        window.mostrarAviso('Erro de Ligação', 'Não foi possível conectar ao servidor. Tente novamente mais tarde.', '#d9534f');
    } finally {
        btnSubmit.innerText = textoOriginal;
        btnSubmit.disabled = false;
    }
};

window.enviarCandidaturaVaga = async function() {
    const form = document.getElementById('formCandidaturaVaga');
    
    // Força o navegador a verificar os campos
    if (!form.reportValidity()) {
        return;
    }

    const userToken = localStorage.getItem('token');
    const btnSubmit = document.getElementById('btnEnviarCandidatura');
    const textoOriginal = btnSubmit.innerText;
    
    btnSubmit.innerText = 'A enviar...';
    btnSubmit.disabled = true;

    const idVaga = document.getElementById('candidaturaVagaId').value;
    const formData = new FormData();
    formData.append('nome', document.getElementById('candidaturaNome').value);
    formData.append('email', document.getElementById('candidaturaEmail').value);
    formData.append('curso', document.getElementById('candidaturaCurso').value);
    formData.append('telefone', document.getElementById('candidaturaTelefone').value);
    formData.append('linkedin', document.getElementById('candidaturaLinkedin').value);
    
    const fileInput = document.getElementById('candidaturaCurriculo');
    if (fileInput && fileInput.files.length > 0) {
        formData.append('curriculo', fileInput.files[0]);
    }

    try {
        const response = await fetch(`http://localhost:3000/api/vagas/${idVaga}/candidaturas`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + userToken },
            body: formData
        });

        const data = await response.json();

        if (response.status === 201 || response.ok) {
            window.fecharModalCandidatura();
            window.mostrarAviso('Sucesso', 'Candidatura enviada com sucesso!', '#28a745');
        } else {
            window.mostrarAviso('Atenção', data.erro || 'Você já se candidatou a esta vaga.', '#d9534f');
        }
    } catch (err) {
        window.mostrarAviso('Erro', 'Servidor indisponível no momento.', '#d9534f');
    } finally {
        btnSubmit.innerText = textoOriginal;
        btnSubmit.disabled = false;
    }
};