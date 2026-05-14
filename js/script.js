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

    // Busca os dados da API e injeta no HTML
    async function carregarCursos() {
        try {
            const response = await fetch('http://localhost:3000/api/cursos');
            const cursos = await response.json();
            
            const grid = document.querySelector('.courses-grid');
            if (!grid) return;
            
            grid.innerHTML = ''; // Limpa os cards fixos do HTML

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
                    // Adiciona a classe 'hidden' por padrão para a aba não ativa
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

            // Reaplica a lógica de abas após injetar os novos elementos
            setupFilter('.filter-courses .tab-pill', '.courses-grid .course-card');
        } catch (error) {
            console.error('Erro ao buscar cursos na API:', error);
        }
    }

    setupFilter('.filter-library .tab-pill', '.library-grid .lib-card');
    
    // Inicia a requisição à API
    carregarCursos();
});