document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();

    // Extrair ID da URL
    const urlParams = new URLSearchParams(window.location.search);
    const projetoId = urlParams.get('id');

    if (!projetoId) {
        exibirFeedback(
            'Nenhum projeto encontrado',
            'Não foi possível encontrar o ID do projeto na URL.',
            false
        );
        return;
    }

    carregarProjeto(projetoId);

    // Função para verificar status de autenticação (Navbar)
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
            if (adminLink) adminLink.style.display = (user.tipo === 'ORIENTADOR' || user.tipo === 'ALUNO_INTERNO' || user.tipo === 'COORDENADOR' || user.tipo === 'ADMIN') ? 'block' : 'none';
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (adminLink) adminLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'none';
        }
    }

    // Função global de logout
    window.logout = function() {
        localStorage.clear();
        window.location.href = 'index.html';
    };

    // Função para exibir mensagens de feedback (carregamento, erro ou não encontrado)
    function exibirFeedback(titulo, mensagem, isError = false) {
        const feedbackContainer = document.getElementById('feedbackContainer');
        const detalhesContainer = document.getElementById('detalhesProjeto');

        if (detalhesContainer) detalhesContainer.style.display = 'none';
        if (feedbackContainer) {
            feedbackContainer.style.display = 'block';
            feedbackContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid ${isError ? '#d9534f' : '#eee'}; max-width: 600px; margin: 40px auto;">
                    <h2 style="color: ${isError ? '#d9534f' : '#333'}; margin-bottom: 15px; font-size: 1.8rem;">${titulo}</h2>
                    <p style="color: #666; font-size: 1.1rem; line-height: 1.6;">${mensagem}</p>
                    <a href="index.html#portfolio" class="btn btn-dark" style="margin-top: 25px; display: inline-block;">Voltar para Portfólio</a>
                </div>
            `;
        }
    }

    // Helper para extrair ID do YouTube
    function obterYouTubeId(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Função para carregar dados do projeto
    async function carregarProjeto(id) {
        const feedbackContainer = document.getElementById('feedbackContainer');
        const detalhesContainer = document.getElementById('detalhesProjeto');

        // Estado de Loading
        if (feedbackContainer) {
            feedbackContainer.style.display = 'block';
            feedbackContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #666;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; margin-bottom: 15px; color: #007bff;"></i>
                    <p style="font-size: 1.1rem;">A carregar os detalhes do projeto...</p>
                </div>
            `;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/portfolio/${id}`);
            
            if (response.status === 404) {
                exibirFeedback(
                    'Projeto não encontrado',
                    'O projeto solicitado não existe ou foi removido.',
                    false
                );
                return;
            }

            if (!response.ok) {
                throw new Error('Erro do servidor');
            }

            const projeto = await response.json();

            // Ocultar feedback e mostrar container do projeto
            if (feedbackContainer) feedbackContainer.style.display = 'none';
            if (detalhesContainer) detalhesContainer.style.display = 'grid';

            // Título
            document.getElementById('projetoTitulo').innerText = projeto.titulo;

            // Metadados (Autor e Turma)
            document.getElementById('projetoMeta').innerHTML = `
                <span><strong>Autor:</strong> ${projeto.autor}</span>
                <span style="margin-left: 20px;"><strong>Turma:</strong> ${projeto.turma}</span>
            `;

            // Tags
            const tagsContainer = document.getElementById('projetoTags');
            tagsContainer.innerHTML = '';
            if (projeto.tags) {
                const tagsList = projeto.tags.split(',');
                tagsList.forEach(tag => {
                    const badge = document.createElement('span');
                    badge.className = 'tag-sm';
                    badge.innerText = tag.trim();
                    tagsContainer.appendChild(badge);
                });
            }

            // GitHub Button
            const btnGithub = document.getElementById('btnGithub');
            if (projeto.link_github && projeto.link_github.trim() !== '') {
                btnGithub.href = projeto.link_github;
                btnGithub.style.display = 'inline-flex';
            } else {
                btnGithub.style.display = 'none';
            }

            // Video Button & Video Block
            const btnVideo = document.getElementById('btnVideo');
            const videoContainer = document.getElementById('videoContainer');
            const imagemDestaque = document.getElementById('imagemDestaque');

            const ytId = obterYouTubeId(projeto.link_video);

            if (projeto.link_video && projeto.link_video.trim() !== '') {
                btnVideo.href = projeto.link_video;
                btnVideo.style.display = 'inline-flex';

                if (ytId) {
                    videoContainer.innerHTML = `
                        <iframe src="https://www.youtube.com/embed/${ytId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"></iframe>
                    `;
                    videoContainer.style.display = 'block';
                    imagemDestaque.style.display = 'none';
                } else {
                    videoContainer.style.display = 'none';
                    imagemDestaque.style.display = 'block';
                }
            } else {
                btnVideo.style.display = 'none';
                videoContainer.style.display = 'none';
                imagemDestaque.style.display = 'block';
            }

            // Imagens e Galeria
            const galeriaContainer = document.getElementById('galeriaContainer');
            const projetoGaleria = document.getElementById('projetoGaleria');
            projetoGaleria.innerHTML = '';

            const imagens = projeto.imagens_paths || [];
            
            if (imagens.length > 0) {
                // Definir imagem padrão de destaque caso o vídeo não tome seu lugar
                if (!ytId) {
                    imagemDestaque.src = `http://localhost:3000${imagens[0]}`;
                    imagemDestaque.style.display = 'block';
                }

                // Renderizar galeria se houver imagens
                imagens.forEach((img, idx) => {
                    const thumb = document.createElement('img');
                    thumb.src = `http://localhost:3000${img}`;
                    thumb.alt = `Miniatura ${idx + 1}`;
                    thumb.style.width = '100%';
                    thumb.style.height = '70px';
                    thumb.style.objectFit = 'cover';
                    thumb.style.borderRadius = '4px';
                    thumb.style.cursor = 'pointer';
                    thumb.style.border = idx === 0 && !ytId ? '2px solid #007bff' : '1px solid #ddd';
                    thumb.style.transition = 'border-color 0.2s';

                    thumb.addEventListener('click', () => {
                        // Desmarcar todas as bordas
                        Array.from(projetoGaleria.children).forEach(child => {
                            child.style.border = '1px solid #ddd';
                        });
                        // Marcar selecionada
                        thumb.style.border = '2px solid #007bff';

                        // Trocar para a imagem e ocultar vídeo
                        imagemDestaque.src = `http://localhost:3000${img}`;
                        imagemDestaque.style.display = 'block';
                        videoContainer.style.display = 'none';
                    });

                    projetoGaleria.appendChild(thumb);
                });

                // Se houver vídeo no youtube, adicionar uma miniatura para o vídeo também
                if (ytId) {
                    const ytThumb = document.createElement('div');
                    ytThumb.style.width = '100%';
                    ytThumb.style.height = '70px';
                    ytThumb.style.borderRadius = '4px';
                    ytThumb.style.cursor = 'pointer';
                    ytThumb.style.border = '2px solid #007bff'; // Começa ativo
                    ytThumb.style.background = '#000';
                    ytThumb.style.display = 'flex';
                    ytThumb.style.justifyContent = 'center';
                    ytThumb.style.alignItems = 'center';
                    ytThumb.style.color = '#ff0000';
                    ytThumb.innerHTML = '<i class="fab fa-youtube" style="font-size: 2rem;"></i>';

                    // Ajustar bordas dos outros polegares no início
                    Array.from(projetoGaleria.children).forEach(child => {
                        child.style.border = '1px solid #ddd';
                    });

                    ytThumb.addEventListener('click', () => {
                        Array.from(projetoGaleria.children).forEach(child => {
                            child.style.border = '1px solid #ddd';
                        });
                        ytThumb.style.border = '2px solid #007bff';

                        imagemDestaque.style.display = 'none';
                        videoContainer.style.display = 'block';
                    });

                    // Inserir miniatura do vídeo na primeira posição da galeria
                    projetoGaleria.insertBefore(ytThumb, projetoGaleria.firstChild);
                }

                galeriaContainer.style.display = 'block';
            } else {
                // Caso não tenha imagens
                if (!ytId) {
                    imagemDestaque.src = 'images/default-portfolio.jpg';
                    imagemDestaque.style.display = 'block';
                }
                galeriaContainer.style.display = 'none';
            }

            // Conteúdo (Formatado usando a biblioteca Marked)
            const conteudoContainer = document.getElementById('projetoConteudo');
            if (conteudoContainer && typeof marked !== 'undefined') {
                conteudoContainer.innerHTML = marked.parse(projeto.conteudo);
            } else if (conteudoContainer) {
                conteudoContainer.innerText = projeto.conteudo;
            }

        } catch (error) {
            console.error('Erro ao buscar detalhes do projeto:', error);
            exibirFeedback(
                'Erro ao carregar dados',
                'Erro ao carregar os dados. Verifique a sua ligação à internet ou tente novamente mais tarde.',
                true
            );
        }
    }
});
