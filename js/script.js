document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();

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

    // Verificação de Candidatura Pendente Pós-Login
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

    // Modal de Candidatura - Abrir
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
        
        // Resetar os campos
        document.getElementById('candidaturaNome').value = '';
        document.getElementById('candidaturaEmail').value = '';
        document.getElementById('candidaturaCurso').value = '';
        document.getElementById('candidaturaTelefone').value = '';
        document.getElementById('candidaturaLinkedin').value = '';
        document.getElementById('candidaturaCurriculo').value = '';
        
        const feedback = document.getElementById('feedbackCandidatura');
        feedback.innerText = '';
        feedback.style.display = 'none';

        document.getElementById('modalCandidaturaVaga').style.display = 'flex';
    };

    // Modal de Candidatura - Fechar
    window.fecharModalCandidatura = function() {
        document.getElementById('modalCandidaturaVaga').style.display = 'none';
        document.getElementById('formCandidaturaVaga').reset();
    };

    // Máscara de Telefone
    const inputTelefone = document.getElementById('candidaturaTelefone');
    if (inputTelefone) {
        inputTelefone.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }

    // Envio do formulário de candidatura
    const formCandidatura = document.getElementById('formCandidaturaVaga');
    if (formCandidatura) {
        formCandidatura.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userToken = localStorage.getItem('token');
            const feedback = document.getElementById('feedbackCandidatura');
            
            feedback.style.display = 'block';
            feedback.innerText = 'Enviando candidatura...';
            feedback.style.color = '#666';

            const idVaga = document.getElementById('candidaturaVagaId').value;
            
            const formData = new FormData();
            formData.append('nome', document.getElementById('candidaturaNome').value);
            formData.append('email', document.getElementById('candidaturaEmail').value);
            formData.append('curso', document.getElementById('candidaturaCurso').value);
            formData.append('telefone', document.getElementById('candidaturaTelefone').value);
            formData.append('linkedin', document.getElementById('candidaturaLinkedin').value);
            
            const fileInput = document.getElementById('candidaturaCurriculo');
            if (fileInput.files.length > 0) {
                formData.append('curriculo', fileInput.files[0]);
            }

            try {
                const response = await fetch(`http://localhost:3000/api/vagas/${idVaga}/candidaturas`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + userToken
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.status === 201) {
                    feedback.innerText = 'Candidatura enviada com sucesso!';
                    feedback.style.color = '#28a745';
                    setTimeout(() => {
                        window.fecharModalCandidatura();
                    }, 1500);
                } else if (response.status === 400) {
                    feedback.innerText = data.erro || 'Você já se candidatou a esta vaga.';
                    feedback.style.color = '#d9534f';
                } else {
                    feedback.innerText = data.erro || 'Servidor indisponível no momento.';
                    feedback.style.color = '#d9534f';
                }
            } catch (err) {
                console.error('❌ ERRO AO ENVIAR CANDIDATURA:', err);
                feedback.innerText = 'Servidor indisponível no momento.';
                feedback.style.color = '#d9534f';
            }
        });
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
            const grid = document.querySelector('.courses-grid');
            if (!grid) return;
            
            grid.innerHTML = '';
            cursos.forEach(curso => {
                const dataFormatada = curso.datainicio ? new Date(curso.datainicio).toLocaleDateString('pt-BR') : 'A definir';
                
                grid.innerHTML += `
                    <div class="course-card" data-category="proximos">
                        <div class="course-header">
                            <span class="status-green">Inscrições Abertas</span>
                            <span class="slots">${curso.vagas} vagas disponíveis</span>
                        </div>
                        <h3>${curso.titulo}</h3>
                        <p>${curso.descricao}</p>
                        <ul class="course-info">
                            <li>📅 Início: ${dataFormatada}</li>
                        </ul>
                        <div style="margin-top: 20px; display: flex; gap: 10px;">
                            <button class="btn btn-dark" style="flex: 1;">Inscrever-se</button>
                            <button class="btn btn-outline">Mais Detalhes</button>
                        </div>
                    </div>
                `;
            });
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
            if (!response.ok) {
                throw new Error('Erro na resposta do servidor');
            }
            const tutoriais = await response.json();

            if (tutoriais.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px;">
                        <h3 style="margin-bottom: 10px; color: #333;">Nenhum tutorial encontrado</h3>
                        <p style="color: #666;">Não existem guias práticos publicados no momento. Volte a tentar mais tarde ou contacte um orientador.</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = '';
            tutoriais.forEach(tut => {
                // Obter primeira imagem ou usar fallback
                let imgSrc = 'images/default-tutorial.jpg';
                if (tut.imagens_paths && tut.imagens_paths.length > 0) {
                    imgSrc = `http://localhost:3000${tut.imagens_paths[0]}`;
                }

                // Formatar tags
                const tagsList = tut.tags ? tut.tags.split(',') : [];
                const tagsHtml = tagsList
                    .map(tag => `<span class="tag" style="margin-right: 8px;">${tag.trim()}</span>`)
                    .join('');

                grid.innerHTML += `
                    <div class="card">
                        <img src="${imgSrc}" alt="${tut.titulo}" class="card-img">
                        <div class="card-body">
                            <div style="margin-bottom: 10px;">
                                ${tagsHtml}
                            </div>
                            <h4>${tut.titulo}</h4>
                            <p>${tut.descricao || (tut.conteudo.length > 100 ? tut.conteudo.substring(0, 100) + '...' : tut.conteudo)}</p>
                            <a href="tutorial.html?id=${tut.id}" class="link-arrow">Acessar Tutorial <span aria-hidden="true">&gt;</span></a>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error('Erro ao carregar tutoriais:', error);
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px; border: 1px solid #d9534f;">
                    <p style="color: #d9534f; font-weight: bold;">Erro ao carregar os dados. Verifique a sua ligação à internet ou tente novamente mais tarde.</p>
                </div>
            `;
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

    carregarCursos();
    carregarVagas();
    carregarMateriais();
    carregarTutoriaisHome();
    carregarPortfolio();
    carregarImpacto();
});