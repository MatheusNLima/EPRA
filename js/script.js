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
            const grid = document.querySelector('.courses-grid');
            if (!grid) return;
            
            const containerDinamico = document.getElementById('cursos-container');
            if(containerDinamico) containerDinamico.innerHTML = '';

            if (cursos.length === 0 && containerDinamico) {
                containerDinamico.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1; padding: 20px;">Nenhum curso com inscrições abertas no momento.</p>';
                return;
            }

            let htmlCursos = '';
            cursos.forEach(curso => {
                const dataFormatada = curso.datainicio ? new Date(curso.datainicio).toLocaleDateString('pt-BR') : 'A definir';
                
                // Lógica de visualização dinâmica se não houver vagas
                let statusBandeira = `<span class="status-green">Inscrições Abertas</span>`;
                let vagasInfo = `<span class="slots">${curso.vagas} vagas disponíveis</span>`;
                let botaoAcao = `<button class="btn btn-dark" style="flex: 1;" onclick="abrirFormularioInscricao(${curso.id})">Inscrever-se</button>`;

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
                            <button class="btn btn-outline full-width mt-auto">Candidatar-se</button>
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

    async function carregarTutoriais() {
        try {
            const response = await fetch('http://localhost:3000/api/tutoriais');
            const tutoriais = await response.json();
            const grid = document.querySelector('#tutoriais .grid-3');
            if (!grid) return;

            grid.innerHTML = '';
            tutoriais.forEach(tut => {
                grid.innerHTML += `
                    <div class="tutorial-card">
                        <div class="tutorial-content" style="padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                            <span class="tag-sm">Mão na Massa</span>
                            <h3 style="margin-top: 10px;">${tut.titulo}</h3>
                            <p style="margin-top: 10px; color: #666; font-size: 0.9rem;">${tut.conteudo}</p>
                            <a href="${tut.linkgithub}" target="_blank" class="btn btn-outline" style="margin-top: 15px;">Ver no GitHub</a>
                        </div>
                    </div>
                `;
            });
        } catch (error) { console.error(error); }
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
                if (metrica.descricao === 'Total de Inscritos' && elAlunos) {
                    elAlunos.innerText = metrica.valor;
                }
                if (metrica.descricao === 'Certificados Emitidos' && elHoras) {
                    elHoras.innerText = metrica.valor;
                }
            });

            if (elEscolas && elEscolas.innerText === 'Y') {
                elEscolas.innerText = '12';
            }
        } catch (error) { console.error(error); }
    }

    // Como o carregarCursos vai ser chamado novamente após inscrição, tornei-o global no escopo da página
    window.atualizarVisualizacaoCursos = carregarCursos;

    carregarCursos();
    carregarVagas();
    carregarMateriais();
    carregarTutoriais();
    carregarPortfolio();
    carregarImpacto();
});

// --- FUNÇÕES DE INSCRIÇÃO PÚBLICA ---

window.abrirFormularioInscricao = function(idCurso) {
    document.getElementById('inscricaoCursoId').value = idCurso;
    document.getElementById('modalInscricaoPublica').style.display = 'flex';
};

window.fecharModalInscricao = function() {
    document.getElementById('modalInscricaoPublica').style.display = 'none';
    document.getElementById('formInscricaoPublica').reset();
};

document.getElementById('formInscricaoPublica').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerText;
    btnSubmit.innerText = 'A enviar...';
    btnSubmit.disabled = true;

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
    if (inputArquivo.files.length > 0) {
        formData.append('termo_consentimento', inputArquivo.files[0]);
    }

    try {
        const response = await fetch('http://localhost:3000/api/inscricoes/publica', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Inscrição realizada com sucesso! Fique atento ao seu e-mail.');
            fecharModalInscricao();
            // Atualiza os cursos na tela imediatamente para o aluno ver a vaga a descer!
            if (window.atualizarVisualizacaoCursos) window.atualizarVisualizacaoCursos(); 
        } else {
            // Lemos a mensagem de erro do backend (ex: "Desculpe, as vagas para esta turma esgotaram!")
            const errorData = await response.json();
            alert(errorData.erro || 'Ocorreu um erro ao processar a inscrição. Tente novamente.');
        }
    } catch (error) {
        console.error(error);
        alert('Erro de ligação ao servidor.');
    } finally {
        btnSubmit.innerText = textoOriginal;
        btnSubmit.disabled = false;
    }
});