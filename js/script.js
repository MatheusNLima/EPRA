document.addEventListener('DOMContentLoaded', () => {

    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Fecha o menu ao clicar em um link
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

    // Inicializa filtro da biblioteca
    setupFilter('.filter-library .tab-pill', '.library-grid .lib-card');
    
    // Inicializa filtro dos cursos
    setupFilter('.filter-courses .tab-pill', '.courses-grid .course-card');

});