document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.querySelector('.menu-icon');
    const sideMenu = document.querySelector('.side-menu');

    menuIcon.addEventListener('click', () => {
        sideMenu.classList.toggle('open');
    });

    // Opcional: Fechar o menu ao clicar fora
    document.addEventListener('click', (event) => {
        const isClickInsideMenu = sideMenu.contains(event.target);
        const isClickOnMenuIcon = menuIcon.contains(event.target);

        if (sideMenu.classList.contains('open') && !isClickInsideMenu && !isClickOnMenuIcon) {
            sideMenu.classList.remove('open');
        }
    });
});