document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const msg = document.getElementById('mensagemErro');

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            window.location.href = 'index.html';
        } else {
            msg.innerText = 'E-mail ou senha incorretos, tente novamente.';
        }
    } catch (err) {
        msg.innerText = 'Servidor indisponível no momento.';
    }
});
document.getElementById('formCurso').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const curso = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        datainicio: document.getElementById('dataInicio').value,
        vagas: document.getElementById('vagas').value
    };

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/cursos`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // O segredo da segurança
            },
            body: JSON.stringify(curso)
        });

        if (response.ok) {
            alert('Curso criado com sucesso!');
            location.reload();
        } else {
            alert('Erro ao criar curso.');
        }
    } catch (err) {
        console.error(err);
    }
});