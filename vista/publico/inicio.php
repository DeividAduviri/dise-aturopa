
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>DiseñaTuPrenda | Diseña prendas a tu estilo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="public/estilos/portal.css?v=4">
</head>
<body class="landing-body">
    <header class="landing-header">
        <a class="landing-brand" href="<?= h(url('inicio')) ?>">
            <img class="landing-brand-icon" src="public/img/logo-principal.png" alt="Logo DiseñaTuPrenda">
            <span>
                <b>Diseña<span>TuPrenda</span></b>
                <small>Crea tu estilo, hazlo realidad</small>
            </span>
        </a>
        <nav class="landing-nav" aria-label="Navegación principal">
            <a href="#inicio">Inicio</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#caracteristicas">Características</a>
            <a href="#como-funciona">Cómo funciona</a>
        </nav>
        <div class="landing-actions">
            <a class="landing-login" href="<?= h(url('login')) ?>">Iniciar sesión</a>
            <a class="landing-register" href="<?= h(url('registro')) ?>">Crear cuenta</a>
        </div>
    </header>
    <main>
        <section class="landing-hero" id="inicio">
            <div class="landing-hero-copy">
                <span class="eyebrow">
                    <i></i>
                    DISEÑO Y PERSONALIZACIÓN DE PRENDAS
                </span>
                <h1>
                    Tu estilo,<br>
                    <em>tus propias ideas.</em>
                </h1>
                <p>
                    Transforma tus ideas en diseños únicos. Personaliza vestidos,
                    faldas, blusas y otras prendas femeninas eligiendo modelos,
                    colores, telas y detalles. Diseña de manera fácil, creativa
                    y descubre nuevas posibilidades para expresar tu estilo.
                </p>
                <div class="landing-hero-buttons">
                    <a class="landing-register large" href="<?= h(url('registro')) ?>">
                        Comenzar a diseñar
                        <span>→</span>
                    </a>
                    <a class="landing-outline" href="#como-funciona">
                        Descubrir más
                    </a>
                </div>
                <div class="landing-proof">
                    <span class="proof-icon">✦</span>
                    <span>
                        <b>Diseños personalizados</b>
                        <small>Cada detalle a tu gusto</small>
                    </span>
                    <span class="proof-divider"></span>
                    <span>
                        <b>Creatividad sin límites</b>
                        <small>Expresa tu propio estilo</small>
                    </span>
                </div>
            </div>
            <div class="landing-visual">
                <div class="landing-image-main">
                    <img src="public/img/vestido-hermoso.png" alt="Modelo de vestido para personalizar">
                    <span class="image-label">TU DISEÑO COMIENZA AQUÍ</span>
                </div>
                <div class="landing-image-small">
                    <img src="public/img/vestido-top.png" alt="Modelo de prenda para personalizar">
                </div>
                <div class="landing-floating-note">
                    <span>♡</span>
                    <div>
                        <b>Hecho a tu estilo</b>
                        <small>Colores · telas · detalles</small>
                    </div>
                </div>
                <div class="landing-orbit"></div>
            </div>
        </section>

        <section class="landing-features" id="beneficios">
            <div class="landing-section-title">
                <span class="eyebrow">¿POR QUÉ ELEGIRNOS?</span>
                <h2>Diseñar nunca fue tan fácil</h2>
                <p>
                    Una experiencia pensada para convertir tu creatividad
                    en diseños personalizados de forma sencilla.
                </p>
            </div>
            <div class="feature-grid">
                <article class="feature-card">
                    <span class="feature-number">01</span>
                    <div class="feature-icon">✧</div>
                    <h3>Personalización a tu gusto</h3>
                    <p>
                        Elige los detalles de tus prendas y adapta cada diseño
                        según tus preferencias y estilo personal.
                    </p>
                </article>
                <article class="feature-card">
                    <span class="feature-number">02</span>
                    <div class="feature-icon">♡</div>
                    <h3>Fácil y práctico</h3>
                    <p>
                        Utiliza una plataforma sencilla e intuitiva para
                        explorar modelos y personalizar tus ideas.
                    </p>
                </article>
                <article class="feature-card">
                    <span class="feature-number">03</span>
                    <div class="feature-icon">☆</div>
                    <h3>Tus ideas en un solo lugar</h3>
                    <p>
                        Guarda tus diseños favoritos y conserva tus propuestas
                        para consultarlas cuando quieras.
                    </p>
                </article>
            </div>
        </section>

        <section class="landing-spaces" id="caracteristicas">
            <div>
                <span class="eyebrow">DESCUBRE TODO LO QUE PUEDES HACER</span>
                <h2>Tu creatividad es la protagonista</h2>
                <p>
                    Diseña prendas femeninas a tu manera mediante diferentes
                    opciones de personalización. Explora modelos, combina
                    colores, selecciona detalles y prepara propuestas
                    que reflejen tu personalidad.
                </p>
                <a class="landing-register" href="<?= h(url('registro')) ?>">
                    Crear mi diseño
                    <span>→</span>
                </a>
            </div>
            <div class="space-cards">
                <article class="space-card customer">
                    <span>♧</span>
                    <div>
                        <small>VARIEDAD DE MODELOS</small>
                        <h3>Encuentra tu inspiración</h3>
                        <p>
                            Explora diferentes opciones de vestidos,
                            faldas, blusas, tops y otras prendas femeninas.
                        </p>
                    </div>
                </article>
                <article class="space-card customer">
                    <span>✧</span>
                    <div>
                        <small>DISEÑO PERSONALIZADO</small>
                        <h3>Combina cada detalle</h3>
                        <p>
                            Personaliza colores, telas, escotes, mangas,
                            largos y acabados para conseguir tu diseño ideal.
                        </p>
                    </div>
                </article>
            </div>
        </section>

        <section class="landing-features" id="como-funciona">
            <div class="landing-section-title">
                <span class="eyebrow">COMIENZA EN POCOS PASOS</span>
                <h2>De una idea a un diseño propio</h2>
                <p>
                    Crea tu cuenta y empieza a dar forma a tus ideas
                    con una experiencia sencilla y organizada.
                </p>
            </div>
            <div class="feature-grid">
                <article class="feature-card">
                    <span class="feature-number">01</span>
                    <div class="feature-icon">♧</div>
                    <h3>Crea tu cuenta</h3>
                    <p>
                        Regístrate para acceder a las herramientas
                        de diseño y personalización.
                    </p>
                </article>
                <article class="feature-card">
                    <span class="feature-number">02</span>
                    <div class="feature-icon">✧</div>
                    <h3>Diseña tu prenda</h3>
                    <p>
                        Selecciona un modelo y personaliza sus colores,
                        características y diferentes detalles.
                    </p>
                </article>
                <article class="feature-card">
                    <span class="feature-number">03</span>
                    <div class="feature-icon">♡</div>
                    <h3>Guarda tu propuesta</h3>
                    <p>
                        Conserva tus diseños y comparte tus propuestas
                        mediante la plataforma.
                    </p>
                </article>
            </div>
        </section>

        <section class="landing-spaces">
            <div>
                <span class="eyebrow">ES MOMENTO DE CREAR</span>
                <h2>Una prenda, infinitas posibilidades</h2>
                <p>
                    No necesitas ser especialista en diseño para expresar
                    tus ideas. Diseña, experimenta y personaliza tus prendas
                    favoritas en un espacio creado para tu creatividad.
                </p>
                <a class="landing-register large" href="<?= h(url('registro')) ?>">
                    Comenzar ahora
                    <span>→</span>
                </a>
            </div>
            <div class="landing-image-main">
                <img src="public/img/vestido-top.png" alt="Inspiración para diseños de prendas femeninas">
                <span class="image-label">CREA ALGO ÚNICO</span>
            </div>
        </section>
    </main>

    <footer class="landing-footer">
        <a class="landing-brand" href="<?= h(url('inicio')) ?>">
            <img class="landing-brand-icon" src="public/img/logo-principal.png" alt="Logo DiseñaTuPrenda">
            <span>
                <b>Diseña<span>TuPrenda</span></b>
                <small>Crea tu estilo, hazlo realidad</small>
            </span>
        </a>
        <span>Diseño y personalización de prendas · Sacaba, Cochabamba</span>
        <span>© <?= date('Y') ?> DiseñaTuPrenda</span>
    </footer>
</body>
</html>
