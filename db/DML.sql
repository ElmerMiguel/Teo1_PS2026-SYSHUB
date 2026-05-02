-- ==========================================
-- Datos iniciales Syshub (DML)
-- ==========================================

-- 1. Crear roles principales
INSERT INTO ROL (nombre_rol, descripcion)
VALUES 
  ('ADMINISTRADOR', 'Administrador del sistema'),
  ('ESTUDIANTE', 'Rol base para estudiantes'),
  ('AUXILIAR', 'Usuario auxiliar con permisos de apoyo'),
  ('MODERADOR', 'Usuario moderador con permisos de gestión')
ON CONFLICT (nombre_rol) DO NOTHING;

-- 2. Crear usuarios de prueba
INSERT INTO USUARIO (nombre, apellido, email, password_hash, semestre, carnet)
VALUES 
  ('Admin', 'Syshub', 'admin@syshub.com', '$2a$10$uRPyYPApF7JBuVR4qFHOo.CqlGq8S2U7G0ruOcth7AhM.c6iI6vW2', NULL, '200010001'),
  ('Juan', 'Estudiante', 'estudiante1@syshub.com', '$2a$10$uRPyYPApF7JBuVR4qFHOo.CqlGq8S2U7G0ruOcth7AhM.c6iI6vW2', 3, '202300001'),
  ('Maria', 'Auxiliar', 'auxiliar1@syshub.com', '$2a$10$uRPyYPApF7JBuVR4qFHOo.CqlGq8S2U7G0ruOcth7AhM.c6iI6vW2', 7, '202000002'),
  ('Carlos', 'Moderador', 'moderador1@syshub.com', '$2a$10$uRPyYPApF7JBuVR4qFHOo.CqlGq8S2U7G0ruOcth7AhM.c6iI6vW2', 8, '201900003'),
  ('Ana', 'Lopez', 'estudiante2@syshub.com', '$2a$10$uRPyYPApF7JBuVR4qFHOo.CqlGq8S2U7G0ruOcth7AhM.c6iI6vW2', 9, '201800004');

-- 3. Asignar roles a los usuarios
INSERT INTO USUARIO_ROL (id_usuario, id_rol)
VALUES 
  ((SELECT id_usuario FROM USUARIO WHERE email = 'admin@syshub.com'), (SELECT id_rol FROM ROL WHERE nombre_rol = 'ADMINISTRADOR')),
  ((SELECT id_usuario FROM USUARIO WHERE email = 'estudiante1@syshub.com'), (SELECT id_rol FROM ROL WHERE nombre_rol = 'ESTUDIANTE')),
  ((SELECT id_usuario FROM USUARIO WHERE email = 'auxiliar1@syshub.com'), (SELECT id_rol FROM ROL WHERE nombre_rol = 'AUXILIAR')),
  ((SELECT id_usuario FROM USUARIO WHERE email = 'moderador1@syshub.com'), (SELECT id_rol FROM ROL WHERE nombre_rol = 'MODERADOR')),
  ((SELECT id_usuario FROM USUARIO WHERE email = 'estudiante2@syshub.com'), (SELECT id_rol FROM ROL WHERE nombre_rol = 'ESTUDIANTE'));

-- 4. Crear Etiquetas (Tags)
INSERT INTO ETIQUETA (nombre, color)
VALUES
  ('Java', '#e74c3c'),
  ('Python', '#f1c40f'),
  ('PostgreSQL', '#3498db'),
  ('React', '#9b59b6'),
  ('Machine Learning', '#2ecc71'),
  ('Compiladores', '#e67e22');

-- 5. Crear Categorías (Pensum / Áreas Técnicas)
INSERT INTO CATEGORIA (nombre, descripcion, area_tecnica)
VALUES
  ('Programación 1', 'Introducción a la programación orientada a objetos', 'Desarrollo'),
  ('Bases de Datos 1', 'Modelo relacional y SQL', 'Bases_de_Datos'),
  ('Inteligencia Artificial 1', 'Fundamentos de IA y Machine Learning', 'IA'),
  ('Redes de Computadoras 1', 'Capa física, enlace y red', 'Redes');

-- Subcategorías (Ejemplo)
INSERT INTO CATEGORIA (nombre, descripcion, area_tecnica, id_categoria_padre)
VALUES
  ('Proyecto Final - DB1', 'Proyectos desarrollados al final del curso', 'Bases_de_Datos', (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Bases de Datos 1')),
  ('Práctica 1 - Compiladores', 'Análisis Léxico', 'Desarrollo', NULL);

-- 6. Crear Proyectos
INSERT INTO PROYECTO (titulo, descripcion, stack_tecnologico, estado, id_usuario, id_categoria, vistas)
VALUES
  ('Sistema de Gestión de Inventario', 'Un proyecto para gestionar inventarios utilizando Java y PostgreSQL.', '{"lenguajes": ["Java", "SQL"], "frameworks": ["Spring Boot"]}', 'publicado', (SELECT id_usuario FROM USUARIO WHERE email = 'estudiante2@syshub.com'), (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Bases de Datos 1'), 15),
  ('Chatbot de Asistencia', 'Implementación de un chatbot con NLP básico usando Python.', '{"lenguajes": ["Python"], "librerias": ["NLTK", "TensorFlow"]}', 'publicado', (SELECT id_usuario FROM USUARIO WHERE email = 'estudiante1@syshub.com'), (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Inteligencia Artificial 1'), 42),
  ('Borrador - Simulador de Redes', 'Proyecto en desarrollo sobre simulación de enrutamiento OSI.', '{"lenguajes": ["C++"]}', 'borrador', (SELECT id_usuario FROM USUARIO WHERE email = 'estudiante2@syshub.com'), (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Redes de Computadoras 1'), 0);

-- 7. Asociar Etiquetas a Proyectos
INSERT INTO PROYECTO_ETIQUETA (id_proyecto, id_etiqueta)
VALUES
  ((SELECT id_proyecto FROM PROYECTO WHERE titulo = 'Sistema de Gestión de Inventario'), (SELECT id_etiqueta FROM ETIQUETA WHERE nombre = 'Java')),
  ((SELECT id_proyecto FROM PROYECTO WHERE titulo = 'Sistema de Gestión de Inventario'), (SELECT id_etiqueta FROM ETIQUETA WHERE nombre = 'PostgreSQL')),
  ((SELECT id_proyecto FROM PROYECTO WHERE titulo = 'Chatbot de Asistencia'), (SELECT id_etiqueta FROM ETIQUETA WHERE nombre = 'Python')),
  ((SELECT id_proyecto FROM PROYECTO WHERE titulo = 'Chatbot de Asistencia'), (SELECT id_etiqueta FROM ETIQUETA WHERE nombre = 'Machine Learning'));

-- 8. Crear Curaduría (Auxiliares destacando proyectos)
INSERT INTO CURADURIA (id_proyecto, id_auxiliar, comentario_auxiliar, activo)
VALUES
  ((SELECT id_proyecto FROM PROYECTO WHERE titulo = 'Chatbot de Asistencia'), (SELECT id_usuario FROM USUARIO WHERE email = 'auxiliar1@syshub.com'), 'Excelente uso de NLP para resolver requerimientos de la asignatura. Altamente recomendado como referencia.', TRUE);

-- 9. Crear Hilos en Foro (Sys-Reddit)
INSERT INTO HILO_FORO (titulo, contenido, id_usuario, id_categoria, estado, vistas, fijado)
VALUES
  ('Duda conceptual: Diferencia entre INNER JOIN y LEFT JOIN', 'Alguien me puede explicar de forma sencilla la diferencia con ejemplos prácticos? Me confundo en las consultas complejas.', (SELECT id_usuario FROM USUARIO WHERE email = 'estudiante1@syshub.com'), (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Bases de Datos 1'), 'abierto', 20, FALSE),
  ('Recursos recomendados para aprender React', 'He recopilado algunos enlaces buenos para empezar con React. Dejen los suyos en los comentarios.', (SELECT id_usuario FROM USUARIO WHERE email = 'auxiliar1@syshub.com'), (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Programación 1'), 'abierto', 55, TRUE);

-- 10. Crear Artículos (Blogs de formato largo)
INSERT INTO ARTICULO (titulo, contenido_html, resumen, id_autor, estado)
VALUES
  ('Introducción a Docker para Entornos de Desarrollo', '<h1>Docker</h1><p>Docker es esencial para evitar el "en mi máquina funciona". Aquí te explico cómo...</p>', 'Guía rápida para configurar Docker en tus proyectos de ingeniería.', (SELECT id_usuario FROM USUARIO WHERE email = 'auxiliar1@syshub.com'), 'publicado');

-- 11. Agregar Comentarios
INSERT INTO COMENTARIO (contenido, id_usuario, id_hilo, id_articulo, id_comentario_padre)
VALUES
  ('El INNER JOIN solo trae los registros que coinciden en ambas tablas. El LEFT JOIN trae todo de la tabla izquierda y lo que coincida de la derecha.', (SELECT id_usuario FROM USUARIO WHERE email = 'estudiante2@syshub.com'), (SELECT id_hilo FROM HILO_FORO WHERE titulo LIKE 'Duda conceptual%'), NULL, NULL),
  ('Ohh, ya veo, entonces si quiero todos mis usuarios aunque no tengan perfiles uso LEFT JOIN, no?', (SELECT id_usuario FROM USUARIO WHERE email = 'estudiante1@syshub.com'), (SELECT id_hilo FROM HILO_FORO WHERE titulo LIKE 'Duda conceptual%'), NULL, 1);

-- 12. Agregar Valoraciones (Upvotes/Downvotes)
INSERT INTO VALORACION (tipo, id_usuario, id_hilo, id_comentario, id_articulo)
VALUES
  ('upvote', (SELECT id_usuario FROM USUARIO WHERE email = 'estudiante1@syshub.com'), (SELECT id_hilo FROM HILO_FORO WHERE titulo LIKE 'Recursos recomendados%'), NULL, NULL),
  ('upvote', (SELECT id_usuario FROM USUARIO WHERE email = 'estudiante1@syshub.com'), NULL, 1, NULL), -- upvote a la respuesta de ana
  ('upvote', (SELECT id_usuario FROM USUARIO WHERE email = 'moderador1@syshub.com'), NULL, NULL, (SELECT id_articulo FROM ARTICULO WHERE titulo LIKE 'Introducción a Docker%'));

-- 13. Agregar Material Guardado (Marcadores)
INSERT INTO MATERIAL_GUARDADO (id_usuario, tipo_contenido, id_contenido)
VALUES
  ((SELECT id_usuario FROM USUARIO WHERE email = 'estudiante1@syshub.com'), 'proyecto', (SELECT id_proyecto FROM PROYECTO WHERE titulo = 'Sistema de Gestión de Inventario')),
  ((SELECT id_usuario FROM USUARIO WHERE email = 'estudiante1@syshub.com'), 'articulo', (SELECT id_articulo FROM ARTICULO WHERE titulo LIKE 'Introducción a Docker%'));

-- 14. Agregar Vistas de Proyectos
INSERT INTO PROYECTO_VISTA (id_proyecto, id_usuario)
VALUES
  ((SELECT id_proyecto FROM PROYECTO WHERE titulo = 'Sistema de Gestión de Inventario'), (SELECT id_usuario FROM USUARIO WHERE email = 'estudiante1@syshub.com')),
  ((SELECT id_proyecto FROM PROYECTO WHERE titulo = 'Chatbot de Asistencia'), (SELECT id_usuario FROM USUARIO WHERE email = 'admin@syshub.com'));

-- 15. Crear Auditorías de Admin
INSERT INTO ADMIN_AUDIT (accion, entidad, entidad_id, detalles, id_admin)
VALUES
  ('CREATE_CATEGORY', 'categoria', 1, '{"nombre": "Programación 1"}', (SELECT id_usuario FROM USUARIO WHERE email = 'admin@syshub.com')),
  ('CREATE_SYS_USER', 'usuario', 2, '{"rol": "ESTUDIANTE"}', (SELECT id_usuario FROM USUARIO WHERE email = 'admin@syshub.com'));

-- 16. Reportes
INSERT INTO REPORTE (razon, descripcion, estado, id_reportador, id_hilo)
VALUES
  ('Spam', 'Este hilo contiene enlaces a sitios de terceros no relacionados con la universidad', 'pendiente', (SELECT id_usuario FROM USUARIO WHERE email = 'estudiante2@syshub.com'), (SELECT id_hilo FROM HILO_FORO WHERE titulo LIKE 'Recursos recomendados%'));