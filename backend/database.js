const { Pool } = require('pg');

// Tu cadena de conexión directa de Neon
const connectionString = 'postgresql://neondb_owner:npg_nfC6hgo5UKVM@ep-lingering-sunset-b436b3b0-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});
// Función para inicializar las tablas y datos iniciales de forma asincrónica
async function inicializarBD() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Tabla de Usuarios
        await client.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                telefono TEXT,
                direccion TEXT,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Tabla de Productos
        await client.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id SERIAL PRIMARY KEY,
                nombre TEXT NOT NULL,
                categoria TEXT DEFAULT 'Snacks',
                precio INTEGER NOT NULL,
                imagen TEXT,
                disponible INTEGER DEFAULT 1,
                stock_unidades INTEGER DEFAULT 10,
                descripcion TEXT
            );
        `);

        // 3. Tabla de Órdenes (Incluye columna despachado por defecto)
        await client.query(`
            CREATE TABLE IF NOT EXISTS ordenes (
                id SERIAL PRIMARY KEY,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                cliente_nombre TEXT NOT NULL,
                cliente_telefono TEXT NOT NULL,
                cliente_direccion TEXT NOT NULL,
                cliente_email TEXT,
                total INTEGER NOT NULL,
                estado TEXT DEFAULT 'PAGADO',
                despachado INTEGER DEFAULT 0,
                items_json TEXT NOT NULL
            );
        `);

        await client.query('COMMIT');
        console.log('✅ Base de datos PostgreSQL verificada e inicializada.');

        const resCount = await pool.query('SELECT COUNT(*) as count FROM productos');
        if (parseInt(resCount.rows[0].count, 10) === 0) {
            const productosIniciales = [
                ['Kit de Bordado Moderno "Flores de Primavera"', 'bordados', 12990, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80', 1, 10, 'Kit completo para principiantes con bastidor, hilos de colores, agujas y patrón impreso.'],
                ['Amigurumi tierno "Oso Dormilón"', 'crochet', 15990, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', 1, 5, 'Tejido a mano con hilo 100% algodón hipoalergénico, ideal para regalar o decorar.'],
                ['Set de Pintura Acrílica Profesional (12 Colores)', 'pintura', 18990, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80', 1, 12, 'Pinturas acrílicas de alta pigmentación y excelente cobertura para tela, madera y lienzo.'],
                ['Bastidor de Madera para Bordar 20cm', 'bordados', 3490, 'https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=600&q=80', 1, 20, 'Bastidor de madera de bambú pulido de alta resistencia, perfecto para tus proyectos.'],
                ['Lana Merino Artesanal (Ovillo 100g)', 'crochet', 6990, 'https://images.unsplash.com/photo-1611084481486-d254f15ddf9e?auto=format&fit=crop&w=600&q=80', 1, 15, 'Lana suave y abrigadora, perfecta para bufandas, gorros y prendas delicadas.'],
                ['Set de Pinceles de Cerdas Finas (Pack x6)', 'pintura', 7990, 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80', 1, 8, 'Pinceles de precisión con mango ergonómico para detalles en óleo, acrílico y acuarela.'],
                ['Amigurumi "Zorrito tierno del bosque"', 'crochet', 14990, 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=600&q=80', 1, 6, 'Adorable zORRO tejido a mano con detalles bordados con mucho amor y cuidado.'],
                ['Kit DIY Cuadro Pintado a Número', 'pintura', 16990, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80', 1, 7, 'Incluye lienzo numerado, pinturas acrílicas y pinceles para relajarte pintando tu propia obra.']
            ];

            for (const p of productosIniciales) {
                await pool.query(
                    `INSERT INTO productos (nombre, categoria, precio, imagen, disponible, stock_unidades, descripcion) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    p
                );
            }
            console.log('📦 Productos iniciales cargados en PostgreSQL.');
        }

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Error al inicializar PostgreSQL:', e);
    } finally {
        client.release();
    }
}

inicializarBD();

module.exports = pool;