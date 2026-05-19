CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    nombre_cliente VARCHAR(255) NOT NULL,
    tipo_articulo VARCHAR(255) NOT NULL,
    descripcion_extra TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);