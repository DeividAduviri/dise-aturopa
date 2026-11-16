-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-11-2026 a las 21:09:47
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `disenatuprenda_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(90) NOT NULL,
  `descripcion` varchar(240) NOT NULL DEFAULT '',
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `estado`, `creado_en`) VALUES
(1, 'Vestidos', 'Vestidos y vestidos de ocasión para personalizar', 'Activo', '2026-11-16 15:41:16'),
(2, 'Faldas', 'Faldas de distintos cortes y largos', 'Activo', '2026-11-16 15:41:16'),
(3, 'Blusas', 'Blusas para personalizar', 'Activo', '2026-11-16 15:41:16'),
(4, 'Tops', 'Tops y prendas superiores', 'Activo', '2026-11-16 15:41:16'),
(5, 'Chaquetas', 'Chaquetas y prendas exteriores', 'Activo', '2026-11-16 15:41:16'),
(6, 'Pantalones', 'Pantalones y shorts', 'Activo', '2026-11-16 15:41:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion`
--

CREATE TABLE `configuracion` (
  `clave` varchar(70) NOT NULL,
  `valor` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `configuracion`
--

INSERT INTO `configuracion` (`clave`, `valor`) VALUES
('nombre_sistema', 'DiseñaTuPrenda');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_solicitud`
--

CREATE TABLE `detalles_solicitud` (
  `id` int(10) UNSIGNED NOT NULL,
  `solicitud_id` int(10) UNSIGNED NOT NULL,
  `prenda_id` int(10) UNSIGNED DEFAULT NULL,
  `cantidad` smallint(5) UNSIGNED NOT NULL DEFAULT 1,
  `especificaciones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`especificaciones`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disenos`
--

CREATE TABLE `disenos` (
  `id` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `prenda_id` int(10) UNSIGNED DEFAULT NULL,
  `nombre` varchar(120) NOT NULL,
  `talla` varchar(12) NOT NULL,
  `color` varchar(40) NOT NULL,
  `tela` varchar(60) NOT NULL,
  `escote` varchar(60) NOT NULL DEFAULT '',
  `manga` varchar(60) NOT NULL DEFAULT '',
  `largo` varchar(60) NOT NULL DEFAULT '',
  `texto_personalizado` varchar(160) NOT NULL DEFAULT '',
  `ubicacion_texto` enum('Pecho','Espalda') NOT NULL DEFAULT 'Pecho',
  `imagen_referencia` varchar(255) DEFAULT NULL,
  `vista_previa` varchar(255) DEFAULT NULL,
  `personalizacion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`personalizacion_json`)),
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `disenos`
--

INSERT INTO `disenos` (`id`, `usuario_id`, `prenda_id`, `nombre`, `talla`, `color`, `tela`, `escote`, `manga`, `largo`, `texto_personalizado`, `ubicacion_texto`, `imagen_referencia`, `vista_previa`, `personalizacion_json`, `creado_en`) VALUES
(1, 1, 25, 'Vestido largo', 'M', 'Rojo', 'Algodón', '', '', '', '', 'Pecho', NULL, 'public/archivos/diseno_48af5a50993f5010dc62c246.jpg', '{\"prendaId\":25,\"modelo\":\"Vestido largo\",\"color\":\"Rojo\",\"colorHex\":\"#c92848\",\"tela\":\"Algodón\",\"patron\":\"Ninguno\",\"cintura\":70,\"falda\":60,\"talla\":\"M\",\"texto\":\"\",\"posicion\":\"Pecho\",\"textX\":0.5,\"textY\":0.42,\"textSize\":28,\"textRotation\":0,\"angulo\":\"Frente\",\"zoom\":1,\"brushColor\":\"#7c4dff\",\"brushSize\":5,\"strokes\":[]}', '2026-11-16 15:45:00'),
(2, 3, 25, 'Vestido largo', 'M', 'Negro', 'Algodón', '', '', '', '', 'Pecho', NULL, 'public/archivos/diseno_1a97d2cb0727e288b662719d.jpg', '{\"prendaId\":25,\"modelo\":\"Vestido largo\",\"color\":\"Negro\",\"colorHex\":\"#11131b\",\"tela\":\"Algodón\",\"patron\":\"Ninguno\",\"cintura\":70,\"falda\":60,\"talla\":\"M\",\"texto\":\"\",\"posicion\":\"Pecho\",\"textX\":0.5,\"textY\":0.42,\"textSize\":28,\"textRotation\":0,\"angulo\":\"Frente\",\"zoom\":1,\"brushColor\":\"#030303\",\"brushSize\":5,\"strokes\":[]}', '2026-11-16 16:08:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favoritos`
--

CREATE TABLE `favoritos` (
  `id` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `prenda_id` int(10) UNSIGNED NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prendas`
--

CREATE TABLE `prendas` (
  `id` int(10) UNSIGNED NOT NULL,
  `categoria_id` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` varchar(255) NOT NULL DEFAULT '',
  `imagen` varchar(255) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `prendas`
--

INSERT INTO `prendas` (`id`, `categoria_id`, `nombre`, `descripcion`, `imagen`, `estado`, `creado_en`) VALUES
(1, 1, 'Vestido corte A', 'Plantilla vectorial 2D: Vestido corte A', 'public/img/prendas/vestido_corte_a.svg', 'Activo', '2026-11-16 15:41:17'),
(2, 1, 'Vestido largo elegante', 'Plantilla vectorial 2D: Vestido largo elegante', 'public/img/prendas/vestido_largo_elegante.svg', 'Activo', '2026-11-16 15:41:17'),
(3, 1, 'Vestido midi cruzado', 'Plantilla vectorial 2D: Vestido midi cruzado', 'public/img/prendas/vestido_midi_cruzado.svg', 'Activo', '2026-11-16 15:41:17'),
(4, 1, 'Vestido camisero', 'Plantilla vectorial 2D: Vestido camisero', 'public/img/prendas/vestido_camisero.svg', 'Activo', '2026-11-16 15:41:17'),
(5, 2, 'Falda mini plisada', 'Plantilla vectorial 2D: Falda mini plisada', 'public/img/prendas/falda_mini_plisada.svg', 'Activo', '2026-11-16 15:41:17'),
(6, 2, 'Falda lápiz', 'Plantilla vectorial 2D: Falda lápiz', 'public/img/prendas/falda_lapiz.svg', 'Activo', '2026-11-16 15:41:17'),
(7, 2, 'Falda larga fluida', 'Plantilla vectorial 2D: Falda larga fluida', 'public/img/prendas/falda_larga_fluida.svg', 'Activo', '2026-11-16 15:41:17'),
(8, 2, 'Falda midi envolvente', 'Plantilla vectorial 2D: Falda midi envolvente', 'public/img/prendas/falda_midi_envolvente.svg', 'Activo', '2026-11-16 15:41:17'),
(9, 3, 'Blusa básica', 'Plantilla vectorial 2D: Blusa básica', 'public/img/prendas/blusa_basica.svg', 'Activo', '2026-11-16 15:41:17'),
(10, 3, 'Blusa manga globo', 'Plantilla vectorial 2D: Blusa manga globo', 'public/img/prendas/blusa_manga_globo.svg', 'Activo', '2026-11-16 15:41:17'),
(11, 3, 'Blusa cuello V', 'Plantilla vectorial 2D: Blusa cuello V', 'public/img/prendas/blusa_cuello_v.svg', 'Activo', '2026-11-16 15:41:17'),
(12, 3, 'Blusa campesina', 'Plantilla vectorial 2D: Blusa campesina', 'public/img/prendas/blusa_campesina.svg', 'Activo', '2026-11-16 15:41:17'),
(13, 4, 'Top corset', 'Plantilla vectorial 2D: Top corset', 'public/img/prendas/top_corset.svg', 'Activo', '2026-11-16 15:41:17'),
(14, 4, 'Top halter', 'Plantilla vectorial 2D: Top halter', 'public/img/prendas/top_halter.svg', 'Activo', '2026-11-16 15:41:17'),
(15, 4, 'Top asimétrico', 'Plantilla vectorial 2D: Top asimétrico', 'public/img/prendas/top_asimetrico.svg', 'Activo', '2026-11-16 15:41:17'),
(16, 4, 'Crop top', 'Plantilla vectorial 2D: Crop top', 'public/img/prendas/crop_top.svg', 'Activo', '2026-11-16 15:41:17'),
(17, 5, 'Chaqueta corta', 'Plantilla vectorial 2D: Chaqueta corta', 'public/img/prendas/chaqueta_corta.svg', 'Activo', '2026-11-16 15:41:17'),
(18, 5, 'Blazer clásico', 'Plantilla vectorial 2D: Blazer clásico', 'public/img/prendas/blazer_clasico.svg', 'Activo', '2026-11-16 15:41:18'),
(19, 5, 'Chaqueta denim', 'Plantilla vectorial 2D: Chaqueta denim', 'public/img/prendas/chaqueta_denim.svg', 'Activo', '2026-11-16 15:41:18'),
(20, 5, 'Cardigan abierto', 'Plantilla vectorial 2D: Cardigan abierto', 'public/img/prendas/cardigan_abierto.svg', 'Activo', '2026-11-16 15:41:18'),
(21, 6, 'Pantalón recto', 'Plantilla vectorial 2D: Pantalón recto', 'public/img/prendas/pantalon_recto.svg', 'Activo', '2026-11-16 15:41:18'),
(22, 6, 'Pantalón palazzo', 'Plantilla vectorial 2D: Pantalón palazzo', 'public/img/prendas/pantalon_palazzo.svg', 'Activo', '2026-11-16 15:41:18'),
(23, 6, 'Pantalón cargo', 'Plantilla vectorial 2D: Pantalón cargo', 'public/img/prendas/pantalon_cargo.svg', 'Activo', '2026-11-16 15:41:18'),
(24, 6, 'Short de vestir', 'Plantilla vectorial 2D: Short de vestir', 'public/img/prendas/short_vestir.svg', 'Activo', '2026-11-16 15:41:18'),
(25, 1, 'Vestido largo', 'Modelo de demostración para probar colores, patrones y dibujo', 'public/img/vestido-hermoso.png', 'Activo', '2026-11-16 15:41:28'),
(26, 1, 'Vestido corto', 'Modelo de demostración', 'public/img/vestido-hermoso.png', 'Activo', '2026-11-16 15:41:28'),
(27, 2, 'Falda midi', 'Modelo de demostración', 'public/img/vestido-hermoso.png', 'Activo', '2026-11-16 15:41:28'),
(28, 3, 'Top moderno', 'Modelo de demostración', 'public/img/vestido-top.png', 'Activo', '2026-11-16 15:41:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`) VALUES
(1, 'administrador'),
(2, 'usuario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE `solicitudes` (
  `id` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `diseno_id` int(10) UNSIGNED NOT NULL,
  `descripcion` varchar(500) NOT NULL DEFAULT '',
  `estado` enum('Pendiente','En proceso','Aprobada','Rechazada','Finalizada','Archivada') NOT NULL DEFAULT 'Pendiente',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(10) UNSIGNED NOT NULL,
  `rol_id` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `estado` enum('Activo','Bloqueado') NOT NULL DEFAULT 'Activo',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `rol_id`, `nombre`, `correo`, `password_hash`, `estado`, `creado_en`) VALUES
(1, 1, 'deivid', 'correo@gmail.com', '$2y$10$YxUGDOeMtXh./tEHjGVTVuHm0jSaXCP4hks.vZzknPBetUdHuLtjW', 'Activo', '2026-11-16 15:40:09'),
(2, 1, 'Administrador', 'correo@gmail.com.com', 'correo123', 'Activo', '2026-11-16 15:52:00'),
(3, 2, 'colli', 'colli@gmail.com', '$2y$10$p7CFQBoh4wM7ETPcbZrfyOROCYTFUKp4E16xFQPKVq0dbqvUQhsCS', 'Activo', '2026-11-16 16:07:06');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`clave`);

--
-- Indices de la tabla `detalles_solicitud`
--
ALTER TABLE `detalles_solicitud`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_detalle_solicitud` (`solicitud_id`),
  ADD KEY `fk_detalle_prenda` (`prenda_id`);

--
-- Indices de la tabla `disenos`
--
ALTER TABLE `disenos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_diseno_usuario` (`usuario_id`),
  ADD KEY `fk_diseno_prenda` (`prenda_id`);

--
-- Indices de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_favorito_usuario_prenda` (`usuario_id`,`prenda_id`),
  ADD KEY `fk_favorito_prenda` (`prenda_id`),
  ADD KEY `idx_favoritos_usuario` (`usuario_id`);

--
-- Indices de la tabla `prendas`
--
ALTER TABLE `prendas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_prenda_cat` (`categoria_id`),
  ADD KEY `idx_prenda_nombre` (`nombre`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_solicitud_usuario` (`usuario_id`),
  ADD KEY `fk_solicitud_diseno` (`diseno_id`),
  ADD KEY `idx_estado_fecha` (`estado`,`creado_en`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `fk_usuario_rol` (`rol_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `detalles_solicitud`
--
ALTER TABLE `detalles_solicitud`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `disenos`
--
ALTER TABLE `disenos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `prendas`
--
ALTER TABLE `prendas`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalles_solicitud`
--
ALTER TABLE `detalles_solicitud`
  ADD CONSTRAINT `fk_detalle_prenda` FOREIGN KEY (`prenda_id`) REFERENCES `prendas` (`id`),
  ADD CONSTRAINT `fk_detalle_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`);

--
-- Filtros para la tabla `disenos`
--
ALTER TABLE `disenos`
  ADD CONSTRAINT `fk_diseno_prenda` FOREIGN KEY (`prenda_id`) REFERENCES `prendas` (`id`),
  ADD CONSTRAINT `fk_diseno_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `fk_favorito_prenda` FOREIGN KEY (`prenda_id`) REFERENCES `prendas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_favorito_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `prendas`
--
ALTER TABLE `prendas`
  ADD CONSTRAINT `fk_prenda_cat` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);

--
-- Filtros para la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD CONSTRAINT `fk_solicitud_diseno` FOREIGN KEY (`diseno_id`) REFERENCES `disenos` (`id`),
  ADD CONSTRAINT `fk_solicitud_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
