import 'dotenv/config';
// Importamos las variables de entorno:
const { PG_AUTH_USER, PG_PASSWORD, PG_HOST, PG_PORT, PG_DATABASE } =
  process.env;

// Validación CRÍTICA
if (!PG_AUTH_USER || !PG_PASSWORD || !PG_HOST || !PG_PORT || !PG_DATABASE) {
  throw new Error(
    'FATAL: Faltan variables de entorno de Postgres (PG_AUTH_USER, PG_PASSWORD, PG_HOST, PG_PORT, PG_DATABASE) en el archivo .env. Asegúrate de estar en la carpeta backend/ al ejecutar.',
  );
}

// Construye la URL de conexión de PostgreSQL
const url = `postgresql://${PG_AUTH_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}?schema=public`;

// IMPRIMIR LOG SOLICITADO para verificar la URL construida
console.log('----------------------------------------------------');
console.log('Prisma Configuration Loaded:');
console.log('DATABASE_URL construida:', url);
console.log('----------------------------------------------------');

const config = {
  // Configura las bases de datos aquí
  datasources: [
    {
      name: 'db', // Nombre que usamos en schema.prisma
      url, // La URL construida
    },
  ],
};

// Exportar como CommonJS para compatibilidad con Node y la CLI de Prisma
module.exports = config;
