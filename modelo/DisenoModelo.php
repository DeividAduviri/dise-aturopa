<?php
declare(strict_types=1);

class DisenoModelo
{
    public function listarPorUsuario(int $usuarioId): array
    {
        $q = db()->prepare('SELECT d.*, s.id AS solicitud_id, s.estado AS solicitud_estado FROM disenos d LEFT JOIN solicitudes s ON s.diseno_id = d.id WHERE d.usuario_id = ? ORDER BY d.id DESC');
        $q->execute([$usuarioId]);
        return $q->fetchAll();
    }

    public function guardar(array $datos): int
    {
        $sql  = 'INSERT INTO disenos(usuario_id, prenda_id, nombre, talla, color, tela, escote, manga, largo, texto_personalizado, ubicacion_texto, imagen_referencia, vista_previa, personalizacion_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        $stmt = db()->prepare($sql);
        $stmt->execute([
            $datos['usuario_id'], $datos['prenda_id'], $datos['nombre'], $datos['talla'],
            $datos['color'], $datos['tela'], $datos['escote'], $datos['manga'], $datos['largo'],
            $datos['texto_personalizado'], $datos['ubicacion_texto'], $datos['imagen_referencia'],
            $datos['vista_previa'], $datos['personalizacion_json'],
        ]);
        return (int) db()->lastInsertId();
    }

    public function solicitar(int $disenoId, array $datos): int
    {
        $stmt = db()->prepare('INSERT INTO solicitudes(usuario_id, diseno_id, descripcion) VALUES(?,?,?)');
        $stmt->execute([$datos['usuario_id'], $disenoId, $datos['descripcion']]);
        $id = (int) db()->lastInsertId();

        $especificaciones = [
            'talla'               => $datos['talla'],
            'color'               => $datos['color'],
            'tela'                => $datos['tela'],
            'escote'              => $datos['escote'],
            'manga'               => $datos['manga'],
            'largo'               => $datos['largo'],
            'texto_personalizado' => $datos['texto_personalizado'],
            'ubicacion_texto'     => $datos['ubicacion_texto'],
            'personalizacion'     => json_decode($datos['personalizacion_json'], true) ?: [],
        ];

        $stmt = db()->prepare('INSERT INTO detalles_solicitud(solicitud_id, prenda_id, cantidad, especificaciones) VALUES(?,?,1,?)');
        $stmt->execute([$id, $datos['prenda_id'], json_encode($especificaciones, JSON_UNESCAPED_UNICODE)]);
        return $id;
    }
}