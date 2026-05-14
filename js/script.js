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
            
            grid.innerHTML = '';
            cursos.forEach(curso => {
                if (curso.categoria === 'proximos') {
                    grid.innerHTML += `
                        <div class="course-card" data-category="proximos">
                            <div class="course-header">
                                <span class="status-green">${curso.status}</span>
                                <span class="slots">${curso.vagas} vagas disponíveis</span>
                            </div>
                            <h3>${curso.titulo}</h3>
                            <p>${curso.descricao}</p>
                            <ul class="course-info">
                                <li>📅 Início: ${curso.inicio}</li>
                                <li>🕒 ${curso.duracao}</li>
                                <li>📍 ${curso.local}</li>
                            </ul>
                            <div style="margin-top: 20px; display: flex; gap: 10px;">
                                <button class="btn btn-dark" style="flex: 1;">Inscrever-se</button>
                                <button class="btn btn-outline">Mais Detalhes</button>
                            </div>
                        </div>
                    `;
                } else if (curso.categoria === 'historico') {
                    grid.innerHTML += `
                        <div class="course-card archive-card hidden" data-category="historico">
                            <div class="archive-header">
                                <h2 class="archive-year">${curso.ano}</h2>
                                <span class="tag-sm">${curso.qtd_cursos} cursos</span>
                                <span class="tag-sm">${curso.qtd_alunos} alunos</span>
                            </div>
                            <div class="archive-body">
                                <h4>${curso.titulo}</h4>
                            </div>
                            <a href="#" class="archive-link">Ver Detalhes ></a>
                        </div>
                    `;
                }
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
                grid.innerHTML += `
                    <div class="job-card">
                        <div class="job-card-inner">
                            <div class="job-top">
                                <span class="job-badge ${vaga.classeBadge}">${vaga.tipo}</span>
                                <span class="job-location">📍 ${vaga.local}</span>
                            </div>
                            <h3>${vaga.titulo}</h3>
                            <p class="job-desc">${vaga.descricao}</p>
                            <div class="job-details">
                                <p><strong>Requisito:</strong> ${vaga.requisito}</p>
                                <p><strong>Carga:</strong> ${vaga.carga}</p>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #666; margin-bottom: 15px;">
                                <span>👥 ${vaga.qtd_vagas} vagas</span>
                                <span>📅 ${vaga.prazo}</span>
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
                const botao = mat.tipoBotao === 'download' 
                    ? `<button class="btn btn-dark">📥 Baixar Pacote</button>` 
                    : `<button class="btn btn-outline">🔗 Acessar Repositório</button>`;

                grid.innerHTML += `
                    <div class="lib-card" data-category="${mat.categoria}">
                        <div class="lib-icon">📁</div>
                        <h3>${mat.titulo}</h3>
                        <p>${mat.descricao}</p>
                        <span class="lib-meta">${mat.infoExtra}</span>
                        <div style="margin-top: 15px;">${botao}</div>
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
                            <span class="tag-sm">${tut.nivel}</span>
                            <span class="tag-sm">${tut.tipo}</span>
                            <h3 style="margin-top: 10px;">${tut.titulo}</h3>
                            <a href="${tut.link}" class="btn btn-outline" style="margin-top: 15px;">Acessar</a>
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
                        <span class="media-badge" style="font-weight: bold; color: #0056b3;">${item.selo}</span>
                        <h3 style="margin-top: 10px;">${item.titulo}</h3>
                        <p>Autor: ${item.autor}</p>
                        <a href="${item.link}" class="btn btn-outline" style="margin-top: 15px;">Ver Projeto</a>
                    </div>
                `;
            });
        } catch (error) { console.error(error); }
    }

    async function carregarImpacto() {
        try {
            const response = await fetch('http://localhost:3000/api/impacto');
            const impacto = await response.json();
            
            const elEscolas = document.getElementById('num-escolas');
            const elAlunos = document.getElementById('num-alunos');
            const elHoras = document.getElementById('num-horas');

            if (elEscolas) elEscolas.innerText = impacto.escolas_atendidas;
            if (elAlunos) elAlunos.innerText = impacto.alunos_impactados;
            if (elHoras) elHoras.innerText = impacto.horas_ensino;
        } catch (error) { console.error(error); }
    }

    carregarCursos();
    carregarVagas();
    carregarMateriais();
    carregarTutoriais();
    carregarPortfolio();
    carregarImpacto();
});