<?php
$categoriaInicial = $categorias[0] ?? '';
if ($selectedPrendaId > 0) {
    foreach ($modelos as $modeloInicial) {
        if ((int) $modeloInicial['id'] === $selectedPrendaId) { $categoriaInicial = $modeloInicial['categoria']; break; }
    }
}
require __DIR__ . '/../componentes/CabeceraDisenador.php';
?>

<div class="category-bar" role="tablist" aria-label="Categorías de prendas">
    <?php foreach ($categorias as $i => $categoria): ?>
        <button
            class="category-tab <?= $categoria === $categoriaInicial ? 'selected' : '' ?>"
            data-category="<?= htmlspecialchars($categoria) ?>"
        >
            <span><?= ['♟', '▤', '♣', '♧', '♜', '♟', '♡', '•••'][$i % 8] ?></span>
            <?= htmlspecialchars($categoria) ?>
        </button>
    <?php endforeach; ?>
</div>

<div class="designer-grid">
    <section class="panel model-panel">
        <h2>Selecciona un modelo base del catálogo</h2>

        <?php if (!$modelos): ?>
            <p class="catalog-empty">
                El catálogo está vacío. El administrador debe registrar y activar
                categorías y prendas antes de guardar diseños.
            </p>
        <?php else: ?>
            <?php
            $agrupados = [];
            foreach ($modelos as $m) {
                $agrupados[$m['categoria']][] = $m;
            }
            $modeloIndex = 0;
            ?>

            <?php foreach ($agrupados as $nombreCategoria => $lista): ?>
                <div class="model-group" data-group="<?= h($nombreCategoria) ?>" <?= $nombreCategoria !== $categoriaInicial ? 'hidden' : '' ?>>
                    <h2 class="subsection-title"><?= h($nombreCategoria) ?></h2>

                    <div class="model-grid three">
                        <?php foreach ($lista as $m): ?>
                            <?php
                            $isChosen = $selectedPrendaId > 0
                                ? ($selectedPrendaId === (int) $m['id'])
                                : ($modeloIndex === 0);
                            $isFavorite = in_array((int) $m['id'], $favoritosIds, true);
                            $style = ($nombreCategoria === 'Faldas')
                                ? 'skirt'
                                : (in_array($nombreCategoria, ['Tops', 'Blusas'], true) ? 'top' : 'dress');
                            $colors = ['pink', 'rose', 'sage', 'red', 'black', 'blue'];
                            $esSvgCatalogo = !empty($m['imagen'])
                                && preg_match('~^public/img/prendas/[a-z0-9_-]+\\.svg$~i', $m['imagen']);
                            $esImagenSubida = !empty($m['imagen'])
                                && preg_match('~^public/archivos/prenda_[0-9a-f]{24}\\.(?:jpg|png|webp)$~', $m['imagen']);
                            $previewEjemplo = [
                                'Vestido largo' => 'public/img/vestido-hermoso.png',
                                'Falda midi'    => 'public/img/vestido-hermoso.png',
                                'Top moderno'   => 'public/img/vestido-top.png',
                                'Vestido corto' => 'public/img/vestido-hermoso.png',
                            ];
                            $imagenVista = ($esSvgCatalogo || $esImagenSubida)
                                ? $m['imagen']
                                : ($previewEjemplo[$m['nombre']] ?? 'public/img/vestido-hermoso.png');
                            ?>

                            <div class="model-tile">
                                <button
                                    class="model-card <?= $isChosen ? 'chosen' : '' ?>"
                                    data-model="<?= h($m['nombre']) ?>"
                                    data-prenda-id="<?= (int) $m['id'] ?>"
                                    data-category="<?= h($nombreCategoria) ?>"
                                    data-img="<?= h($imagenVista) ?>"
                                >
                                    <?php if ($esSvgCatalogo || $esImagenSubida): ?>
                                        <img class="model-card-photo" src="<?= h($imagenVista) ?>" alt="<?= h($m['nombre']) ?>">
                                    <?php elseif ($style === 'skirt'): ?>
                                        <span class="skirt-shape <?= $modeloIndex % 2 ? 'beige' : 'pink' ?>"></span>
                                    <?php elseif ($style === 'top'): ?>
                                        <span class="top-shape white"></span>
                                    <?php else: ?>
                                        <span class="dress-shape <?= h($colors[$modeloIndex % count($colors)]) ?>"></span>
                                    <?php endif; ?>
                                    <span><?= h($m['nombre']) ?></span>
                                </button>

                                <form class="favorite-inline" method="post" action="<?= h(url('favorito_accion')) ?>">
                                    <input type="hidden" name="csrf" value="<?= h(csrf()) ?>">
                                    <input type="hidden" name="prenda_id" value="<?= (int) $m['id'] ?>">
                                    <input type="hidden" name="volver" value="disenador">
                                    <input type="hidden" name="operacion" value="<?= $isFavorite ? 'quitar' : 'agregar' ?>">
                                    <button
                                        type="submit"
                                        class="favorite-mini <?= $isFavorite ? 'is-favorite' : '' ?>"
                                        aria-label="<?= $isFavorite ? 'Quitar de' : 'Agregar a' ?> favoritos"
                                        title="<?= $isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos' ?>"
                                    >
                                        <?= $isFavorite ? '♥' : '♡' ?>
                                    </button>
                                </form>
                            </div>

                            <?php $modeloIndex++; ?>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </section>

    <section class="panel preview-panel">
        <div class="preview-toolbar">
            <button type="button" class="panel-toggle" id="toggleCatalog">☰ Catálogo</button>
            <div class="view-switch">
                <button class="active" data-view="2D">Vista 2D</button>
                <button data-view="3D">Vista 3D</button>
            </div>
            <div class="zoom-controls">
                <button aria-label="Alejar" id="zoomOut">⌕−</button>
                <button aria-label="Acercar" id="zoomIn">⌕+</button>
                <button id="zoomLabel">100%　⌄</button>
                <button aria-label="Pantalla completa" id="fullscreen">⛶</button>
                <button type="button" id="editorThemeToggle" class="editor-theme-toggle" aria-pressed="false" title="Cambiar entre modo claro y oscuro">☀ Modo claro</button>
            </div>
        </div>

        <div class="preview-stage" id="previewStage">
            <div class="tool-rail" aria-label="Herramientas del lienzo">
                <button class="active" data-tool="Seleccionar" title="Seleccionar y mover"><b>↖</b>Seleccionar</button>
                <button data-tool="Texto" title="Añadir texto"><b>T</b>Texto</button>
                <button data-tool="Pincel" title="Dibujar a mano"><b>✎</b>Pincel</button>
                <button data-tool="Balde" title="Balde de pintura: rellenar una zona o una forma"><b>▰</b>Balde</button>
                <button data-tool="Borrador" title="Borrar trazos"><b>⌫</b>Borrador</button>
                <button data-tool="Rectangulo" title="Dibujar rectángulo"><b>▭</b>Rectángulo</button>
                <button data-tool="Cuadrado" title="Dibujar cuadrado"><b>□</b>Cuadrado</button>
                <button data-tool="Circulo" title="Dibujar círculo"><b>◯</b>Círculo</button>
                <button data-tool="Imagen" title="Añadir imagen o logotipo"><b>▧</b>Imagen</button>
                <button data-tool="Rotar" title="Girar objeto seleccionado"><b>⟳</b>Rotar</button>
                <button data-tool="Zoom" title="Acercar"><b>⌕</b>Zoom</button>
                <button data-tool="Restablecer" title="Restablecer diseño"><b>↺</b>Restablecer</button>
                <button type="button" id="deleteSelected" title="Eliminar objeto seleccionado"><b>⌦</b>Eliminar</button>
            </div>
            <img id="garmentPreview" src="public/img/vestido-hermoso.png" alt="Vista previa del vestido seleccionado">
<div class="preview-custom-text" id="previewCustomText" aria-label="Previsualización del texto personalizado"></div>
            <div class="preview-note" id="previewNote">Vista frontal · Vestido largo</div>
        </div>

</section>

    <section class="panel options-panel">
        <div class="step-tabs">
            <button class="active" data-step="1">1. Diseño</button>
            <button data-step="2">2. Colores y telas</button>
            <button data-step="3">3. Detalles</button>
            <button data-step="4">4. Guardar</button>
        </div>

        <div class="options-scroll">
            <div class="editor-help"><strong>Espacio de diseño profesional</strong><p>Selecciona una herramienta, haz clic en el lienzo y edita cada elemento. Usa Ctrl + Z para deshacer y Supr para eliminar.</p></div>
            <section class="layer-manager" aria-label="Capas del diseño">
                <div class="inspector-heading"><h3>Capas</h3><div class="layer-actions"><button type="button" id="duplicateSelected" title="Duplicar elemento">＋ Duplicar</button><button type="button" id="layerUp" title="Traer al frente">↑</button><button type="button" id="layerDown" title="Enviar atrás">↓</button></div></div>
                <div id="layersList" class="layers-list"><p class="layers-empty">Aún no hay elementos añadidos</p></div>
            </section>
            <section class="object-inspector">
                <h3>Propiedades del elemento</h3>
                <label>Color <input type="color" id="objectColor" value="#7c4dff"></label>
                <label>Tamaño del texto <input type="range" id="textSizeControl" min="10" max="80" value="28"><output id="textSizeValue">28 px</output></label>
                <label>Fuente <select id="textFont"><option value="Inter">Moderna</option><option value="Georgia">Elegante</option><option value="Arial">Clásica</option><option value="monospace">Monoespaciada</option></select></label>
            </section>
            <div class="layer-tools"><label>Color de dibujo <input type="color" id="shapeColor" value="#7c4dff"></label><label>Grosor <input type="range" id="shapeWidth" min="1" max="30" value="4"></label><label>Imagen o logotipo <input type="file" id="logoUpload" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label><button type="button" id="removeLogo">Quitar imagen</button><button type="button" id="hideOptions">Ocultar opciones</button></div>
            <h3>Tipo de tela</h3>
            <div class="fabric-row">
                <button><span class="fabric linen"></span>Lino</button>
                <button class="active"><span class="fabric cotton"></span>Algodón</button>
                <button><span class="fabric silk"></span>Seda</button>
                <button><span class="fabric poly"></span>Poliéster</button>
                <button><span class="fabric lace"></span>Encaje</button>
            </div>
        </div>
    </section>

    <section class="panel color-panel">
        <h2>Colores</h2>
        <div class="swatches">
            <button class="swatch pink active" aria-label="Rosa"></button>
            <button class="swatch lilac" aria-label="Lila"></button>
            <button class="swatch beige" aria-label="Beige"></button>
            <button class="swatch black" aria-label="Negro"></button>
            <button class="swatch white" aria-label="Blanco"></button>
            <button class="swatch red" aria-label="Rojo"></button>
            <button class="swatch green" aria-label="Verde"></button>
            <button class="swatch blue" aria-label="Azul"></button>
            <button class="swatch-add" aria-label="Más colores">＋</button>
        </div>
    </section>

    <section class="panel pattern-panel">
        <h2>Patrones y texturas</h2>
        <div class="patterns">
            <button class="pattern floral active" aria-label="Floral"></button>
            <button class="pattern dots" aria-label="Lunares"></button>
            <button class="pattern plaid" aria-label="Cuadros"></button>
            <button class="pattern speckle" aria-label="Puntos"></button>
            <button class="pattern animal" aria-label="Animal print"></button>
            <button class="pattern-add">＋</button>
        </div>
    </section>

    <section class="panel action-panel">
        <label class="design-field">
            Texto
            <input type="text" id="designText" placeholder="Texto opcional" maxlength="160">
        </label>
        <label class="design-field">
            Posición
            <select id="designTextPosition">
                <option>Pecho</option>
                <option>Espalda</option>
            </select>
        </label>
        <label class="design-field">
            Talla
            <select id="designSize" aria-label="Talla de la prenda">
                <option>XS</option>
                <option>S</option>
                <option selected>M</option>
                <option>L</option>
                <option>XL</option>
                <option>XXL</option>
            </select>
        </label>
        <label class="design-field">
            Referencia
            <input
                type="file"
                id="designReference"
                accept="image/png,image/jpeg,image/webp"
                aria-label="Imagen de referencia opcional"
            >
        </label>
        <button class="primary-action" id="saveDesign">▣　Guardar diseño</button>
        <button class="secondary-action" id="addCart">✉　Enviar solicitud</button>
        <p id="actionMessage" aria-live="polite"></p>
        <label class="design-field">Modelo 3D GLB/GLTF <input type="file" id="model3DUpload" accept=".glb,.gltf,model/gltf-binary,model/gltf+json"></label>
        <button type="button" class="secondary-action" id="remove3DModel">Quitar modelo 3D</button>
        <input type="hidden" id="designCsrf" value="<?= h(csrf()) ?>">
    </section>
</div>

<?php
$pageScript = 'public/javascript/disenador.js?v=12';
require __DIR__ . '/../componentes/PiePaginaDisenador.php';
?>