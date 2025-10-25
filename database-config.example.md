# Configuración de Base de Datos

## Configuración Actual
- **Host**: localhost
- **Puerto**: 3310
- **Usuario**: root
- **Contraseña**: (vacía)
- **Base de datos**: educacionnin

## Para modificar la configuración:

1. Edita el archivo `lib/database.ts`
2. Cambia los valores en la variable `dbConfig`:

```typescript
const dbConfig = {
  host: 'localhost',        // Cambiar si es necesario
  port: 3310,              // Cambiar puerto si es necesario
  user: 'root',            // Cambiar usuario
  password: '',            // Cambiar contraseña
  database: 'educacionnin',  // Cambiar nombre de base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
```

## Estructura de la tabla esperada:

```sql
CREATE TABLE usuarios_tb (
  id_usuario int(11) NOT NULL AUTO_INCREMENT,
  NombreCompleto varchar(50) NOT NULL,
  dinero_disponible decimal(11,0) NOT NULL,
  CodigoQR varchar(20) NOT NULL,
  fecha_movimiento datetime NOT NULL DEFAULT current_timestamp(),
  tasa_interes decimal(11,0) NOT NULL DEFAULT 0,
  Foto_perfil varchar(255) NOT NULL,
  PRIMARY KEY (id_usuario)
);
```

## Instrucciones de instalación:

1. Asegúrate de que MySQL esté ejecutándose en el puerto 3310
2. Crea la base de datos `educacionnin`
3. Ejecuta el script SQL para crear la tabla `usuarios_tb`
4. Ejecuta `npm run dev` para iniciar la aplicación
