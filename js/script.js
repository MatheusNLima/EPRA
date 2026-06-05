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

    carregarCursos();
    carregarVagas();
    carregarMateriais();
    carregarTutoriais();
    carregarPortfolio();
    carregarImpacto();
});