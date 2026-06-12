document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();

    // Extrair ID da URL
    const urlParams = new URLSearchParams(window.location.search);
    const tutorialId = urlParams.get('id');

    if (!tutorialId) {
        exibirFeedback(
            'Nenhum tutorial encontrado',
            'Não existem guias práticos publicados no momento. Volte a tentar mais tarde ou contacte um orientador.',
            false
        );
        return;
    }

    carregarTutorial(tutorialId);

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
            if (adminLink) adminLink.style.display = (user.tipo === 'ORIENTADOR') ? 'block' : 'none';
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
        const detalhesContainer = document.getElementById('detalhesTutorial');

        detalhesContainer.style.display = 'none';
        feedbackContainer.style.display = 'block';

        feedbackContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid ${isError ? '#d9534f' : '#eee'}; max-width: 600px; margin: 40px auto;">
                <h2 style="color: ${isError ? '#d9534f' : '#333'}; margin-bottom: 15px; font-size: 1.8rem;">${titulo}</h2>
                <p style="color: #666; font-size: 1.1rem; line-height: 1.6;">${mensagem}</p>
                <a href="index.html#tutoriais" class="btn btn-dark" style="margin-top: 25px; display: inline-block;">Voltar para Página Inicial</a>
            </div>
        `;
    }

    // Função para carregar dados do tutorial
    async function carregarTutorial(id) {
        const feedbackContainer = document.getElementById('feedbackContainer');
        const detalhesContainer = document.getElementById('detalhesTutorial');

        // Estado de Loading
        feedbackContainer.style.display = 'block';
        feedbackContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #666;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; margin-bottom: 15px; color: #007bff;"></i>
                <p style="font-size: 1.1rem;">A carregar os detalhes do tutorial...</p>
            </div>
        `;

        try {
            const response = await fetch(`http://localhost:3000/api/tutoriais/${id}`);
            
            if (response.status === 404) {
                exibirFeedback(
                    'Nenhum tutorial encontrado',
                    'Não existem guias práticos publicados no momento. Volte a tentar mais tarde ou contacte um orientador.',
                    false
                );
                return;
            }

            if (!response.ok) {
                throw new Error('Erro do servidor');
            }

            const tutorial = await response.json();

            // Ocultar feedback e mostrar container do tutorial
            feedbackContainer.style.display = 'none';
            detalhesContainer.style.display = 'grid';

            // Título
            document.getElementById('tutorialTitulo').innerText = tutorial.titulo;

            // Tags
            const tagsContainer = document.getElementById('tutorialTags');
            tagsContainer.innerHTML = '';
            if (tutorial.tags) {
                const tagsList = tutorial.tags.split(',');
                tagsList.forEach(tag => {
                    const badge = document.createElement('span');
                    badge.className = 'tag-sm';
                    badge.innerText = tag.trim();
                    tagsContainer.appendChild(badge);
                });
            }

            // GitHub Button
            const btnGithub = document.getElementById('btnGithub');
            if (tutorial.linkgithub && tutorial.linkgithub.trim() !== '') {
                btnGithub.href = tutorial.linkgithub;
                btnGithub.style.display = 'inline-flex';
            } else {
                btnGithub.style.display = 'none';
            }

            // Video Button & Video Block
            const btnVideo = document.getElementById('btnVideo');
            const videoContainer = document.getElementById('videoContainer');
            const imagemDestaque = document.getElementById('imagemDestaque');

            if (tutorial.link_video && tutorial.link_video.trim() !== '') {
                btnVideo.href = tutorial.link_video;
                btnVideo.style.display = 'inline-flex';

                const ytId = obterYouTubeId(tutorial.link_video);
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
            const tutorialGaleria = document.getElementById('tutorialGaleria');
            tutorialGaleria.innerHTML = '';

            const imagens = tutorial.imagens_paths || [];
            
            if (imagens.length > 0) {
                // Definir imagem padrão de destaque caso o vídeo não tome seu lugar
                if (!obterYouTubeId(tutorial.link_video)) {
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
                    thumb.style.border = idx === 0 && !obterYouTubeId(tutorial.link_video) ? '2px solid #007bff' : '1px solid #ddd';
                    thumb.style.transition = 'border-color 0.2s';

                    thumb.addEventListener('click', () => {
                        // Desmarcar todas as bordas
                        Array.from(tutorialGaleria.children).forEach(child => {
                            child.style.border = '1px solid #ddd';
                        });
                        // Marcar selecionada
                        thumb.style.border = '2px solid #007bff';

                        // Trocar para a imagem e ocultar vídeo
                        imagemDestaque.src = `http://localhost:3000${img}`;
                        imagemDestaque.style.display = 'block';
                        videoContainer.style.display = 'none';
                    });

                    tutorialGaleria.appendChild(thumb);
                });

                // Se houver vídeo no youtube, adicionar uma miniatura para o vídeo também
                const ytId = obterYouTubeId(tutorial.link_video);
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
                    Array.from(tutorialGaleria.children).forEach(child => {
                        child.style.border = '1px solid #ddd';
                    });

                    ytThumb.addEventListener('click', () => {
                        Array.from(tutorialGaleria.children).forEach(child => {
                            child.style.border = '1px solid #ddd';
                        });
                        ytThumb.style.border = '2px solid #007bff';

                        imagemDestaque.style.display = 'none';
                        videoContainer.style.display = 'block';
                    });

                    // Inserir miniatura do vídeo na primeira posição da galeria
                    tutorialGaleria.insertBefore(ytThumb, tutorialGaleria.firstChild);
                }

                galeriaContainer.style.display = 'block';
            } else {
                // Caso não tenha imagens cadastrais
                if (!obterYouTubeId(tutorial.link_video)) {
                    imagemDestaque.src = 'images/default-tutorial.jpg';
                    imagemDestaque.style.display = 'block';
                }
                galeriaContainer.style.display = 'none';
            }

            // Conteúdo (Formatado de Markdown simplificado para HTML)
            const conteudoContainer = document.getElementById('tutorialConteudo');
            conteudoContainer.innerHTML = parseMarkdown(tutorial.conteudo);

        } catch (error) {
            console.error('Erro ao buscar tutorial:', error);
            exibirFeedback(
                'Erro ao carregar dados',
                'Erro ao carregar os dados. Verifique a sua ligação à internet ou tente novamente mais tarde.',
                true
            );
        }
    }

    // Helper para extrair ID do YouTube
    function obterYouTubeId(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Markdown Parser ultra-simplificado
    function parseMarkdown(text) {
        if (!text) return '';
        
        let html = text;

        // Escape HTML básico para prevenir XSS
        html = html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h4 style="margin-top: 20px; margin-bottom: 10px; color: #333;">$1</h4>');
        html = html.replace(/^## (.*$)/gim, '<h3 style="margin-top: 25px; margin-bottom: 12px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">$1</h3>');
        html = html.replace(/^# (.*$)/gim, '<h2 style="margin-top: 30px; margin-bottom: 15px; color: #222;">$1</h2>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Code block
        html = html.replace(/```([\s\S]*?)```/g, '<pre style="background: #f1f3f5; padding: 15px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 0.9rem; margin: 15px 0; border-left: 4px solid #007bff;">$1</pre>');

        // Inline code
        html = html.replace(/`(.*?)`/g, '<code style="background: #f1f3f5; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #d63384;">$1</code>');

        // Lists (Unordered)
        // Primeiro dividimos as linhas para tratar listas
        const lines = html.split('\n');
        let inList = false;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line.startsWith('- ') || line.startsWith('* ')) {
                const content = line.substring(2);
                if (!inList) {
                    lines[i] = '<ul style="margin-bottom: 15px; padding-left: 20px;"><li>' + content + '</li>';
                    inList = true;
                } else {
                    lines[i] = '<li>' + content + '</li>';
                }
            } else {
                if (inList) {
                    lines[i-1] += '</ul>';
                    inList = false;
                }
            }
        }
        if (inList) {
            lines[lines.length - 1] += '</ul>';
        }
        html = lines.join('\n');

        // Line breaks (parágrafos)
        html = html.split('\n\n').map(p => {
            p = p.trim();
            if (p === '') return '';
            // Se já for tag HTML de block, não envolver em <p>
            if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<li') || p.startsWith('<pre') || p.startsWith('</pre') || p.startsWith('</ul>')) {
                return p;
            }
            return `<p style="margin-bottom: 15px;">${p.replace(/\n/g, '<br>')}</p>`;
        }).join('\n');

        return html;
    }
});
