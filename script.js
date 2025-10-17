// Suas chaves do PROJETO ZYNTRA no Supabase
const SUPABASE_URL = 'https://hcxifpimltgyhxrmvlny.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeGlmcGltbHRneWh4cm12bG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDM4NzksImV4cCI6MjA3NjE3OTg3OX0.DD0FCHbwlgMZFO62QsZusvDUbjFlO8uIU8yN2XyvEDk';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- FUNÇÃO AUXILIAR DE IMAGEM (VERSÃO CORRIGIDA) ---
function getPostImageUrl(post) {
    // 1. Se o post tem uma URL de imagem própria, use-a.
    if (post.image_url) {
        return post.image_url;
    }

    // 2. Se não, decida qual imagem padrão usar com base na categoria.
    switch (post.category) {
        case 'tecnologia':
            return 'images/1.png';
        case 'ia':
            return 'images/2.png';
        case 'jogos':
            return 'images/3.png';
        case 'noticias':
            return 'images/4.png';
        default:
            return ''; // Retorna vazio se não houver categoria correspondente
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const pagePath = window.location.pathname.split("/").pop() || "index.html";

    // --- LÓGICA DO MENU ---
    const menuIcon = document.querySelector('.menu-icon');
    const sideMenu = document.querySelector('.side-menu');
    menuIcon.addEventListener('click', () => { sideMenu.classList.toggle('open'); });
    document.addEventListener('click', (event) => {
        if (sideMenu.classList.contains('open') && !sideMenu.contains(event.target) && !menuIcon.contains(event.target)) {
            sideMenu.classList.remove('open');
        }
    });

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderHeroPost(post) {
        const heroSection = document.querySelector('.hero');
        if (!heroSection || !post) return;
        heroSection.innerHTML = `
            <div class="hero-image" style="background-image: url('${getPostImageUrl(post)}');"></div>
            <h1><a href="post.html?id=${post.id}">${post.title}</a></h1>
            <p>${post.description}</p>`;
        const heroImage = heroSection.querySelector('.hero-image');
        heroImage.style.backgroundSize = 'cover';
        heroImage.style.backgroundPosition = 'center';
    }

    function renderSidebarPosts(posts) {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar || !posts) return;
        const itemsContainer = document.createElement('div');
        posts.forEach(post => {
            itemsContainer.innerHTML += `
                <div class="sidebar-post-item">
                    <a href="post.html?id=${post.id}">
                        <div class="item-image" style="background-image: url('${getPostImageUrl(post)}'); background-size: cover; background-position: center;"></div>
                        <div class="item-title">${post.title}</div>
                    </a>
                </div>`;
        });
        sidebar.innerHTML = `<h3>Especiais</h3>`;
        sidebar.appendChild(itemsContainer);
    }

    function renderCategoryCards(containerId, posts) {
        const gridContainer = document.querySelector(`#${containerId} .card-grid`);
        if (!gridContainer || !posts) {
            if(gridContainer) gridContainer.innerHTML = '<p>Nenhum post encontrado nesta categoria.</p>';
            return;
        };
        gridContainer.innerHTML = '';
        if (posts.length === 0) { gridContainer.innerHTML = '<p>Nenhum post encontrado nesta categoria.</p>'; return; }
        posts.forEach(post => {
            gridContainer.innerHTML += `
                <div class="card">
                    <a href="post.html?id=${post.id}">
                        <div class="card-image" style="background-image: url('${getPostImageUrl(post)}'); background-size: cover; background-position: center;"></div>
                        <div class="card-content">
                            <h3 class="card-title">${post.title}</h3>
                            <p class="card-description">${post.description}</p>
                            <span class="card-button">Ler Mais</span>
                        </div>
                    </a>
                </div>`;
        });
    }

    // --- FUNÇÕES DE CARREGAMENTO DE DADOS ---
    async function loadHomePage() {
        const { data: heroPost } = await supabaseClient.from('posts').select('*').eq('placement', 'hero').limit(1).single();
        if (heroPost) renderHeroPost(heroPost);
        const { data: specialPosts } = await supabaseClient.from('posts').select('*').eq('placement', 'especial').order('created_at', { ascending: false }).limit(3);
        if (specialPosts) renderSidebarPosts(specialPosts);
        const { data: techPosts } = await supabaseClient.from('posts').select('*').eq('category', 'tecnologia').order('created_at', { ascending: false }).limit(2);
        renderCategoryCards('tecnologia-section', techPosts);
        const { data: iaPosts } = await supabaseClient.from('posts').select('*').eq('category', 'ia').order('created_at', { ascending: false }).limit(2);
        renderCategoryCards('ia-section', iaPosts);
    }

    async function loadCategoryPage(category) {
        const { data: posts, error } = await supabaseClient.from('posts').select('*').eq('category', category).order('created_at', { ascending: false });
        if (error) { console.error("Erro:", error); }
        else { renderCategoryCards('category-posts-section', posts); }
    }

    async function loadSinglePostPage() {
        const postId = new URLSearchParams(window.location.search).get('id');
        const container = document.getElementById('post-container');
        if (!postId) { container.innerHTML = '<h1>Post não encontrado.</h1>'; return; }

        const { data: post, error } = await supabaseClient.from('posts').select('*').eq('id', postId).single();

        if (error) {
            container.innerHTML = '<h1>Erro ao carregar o post.</h1>';
        } else {
            document.title = `${post.title} - Zyntra`;

        // PASSO 1: Cria a estrutura principal SEM o conteúdo do post.
        container.innerHTML = `
            <button class="card-button" id="back-button" style="margin-bottom: 30px;">&lt; Voltar</button>
            <h1 class="text-page-title">${post.title}</h1>
            <div class="text-page-image" style="background-image: url('${getPostImageUrl(post)}'); background-size: cover; background-position: center;"></div>
            
            <div class="text-page-content"></div> 
        `;

        // PASSO 2: Selecionamos esse container e preenchemos com o innerHTML.
        // Esta é a mágica que garante que o HTML será renderizado.
        const contentDiv = container.querySelector('.text-page-content');
        contentDiv.innerHTML = post.content;

        // O resto do código continua igual
        document.getElementById('back-button').addEventListener('click', () => {
            history.back();
        });
        }
    }

    // --- INICIALIZAÇÃO (O "ROTEADOR") ---
    if (pagePath.includes('index.html') || pagePath === '') {
        loadHomePage();
    } else if (pagePath.includes('tecnologia.html')) {
        loadCategoryPage('tecnologia');
    } else if (pagePath.includes('ia.html')) {
        loadCategoryPage('ia');
    } else if (pagePath.includes('jogos.html')) {
        loadCategoryPage('jogos');
    } else if (pagePath.includes('noticias.html')) {
        loadCategoryPage('noticias');
    } else if (pagePath.includes('post.html')) {
        loadSinglePostPage();
    }
});