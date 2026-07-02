# Facturadiscord

Web para emitir facturas y presupuestos profesionales, más un bot de Discord que
publica esos PDFs bajo demanda mediante comandos, restringido a una lista de
usuarios permitidos.

## Estructura

```
apps/web     Next.js — panel de facturación (login, clientes, empresa, facturas, presupuestos)
apps/bot     Bot de Discord (discord.js) — comandos /factura, /presupuesto, /permitir, /revocar, /permitidos
packages/db  Esquema Prisma (MySQL) compartido por la web y el bot
packages/pdf Plantilla y generación de PDF, compartida por la web y el bot
```

## 1. Requisitos

- Node.js 18.18+ (probado con Node 22)
- Un servidor MySQL accesible (local o remoto)
- Una aplicación de bot creada en el [Discord Developer Portal](https://discord.com/developers/applications)

## 2. Configuración

1. Crea la base de datos vacía:
   ```sql
   CREATE DATABASE facturadiscord CHARACTER SET utf8mb4;
   ```
2. Copia `.env.example` a `.env` en la raíz del proyecto y rellena los valores:
   - `DATABASE_URL`: cadena de conexión a tu MySQL.
   - `SESSION_SECRET`: cadena aleatoria larga (`openssl rand -hex 32`).
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD`: credenciales del usuario web que creará el script de seed.
   - `DISCORD_TOKEN` / `DISCORD_CLIENT_ID`: del Developer Portal, pestaña "Bot" y "General Information".
   - `DISCORD_GUILD_ID` (opcional): ID de tu servidor de pruebas, para que los comandos se registren al instante en vez de esperar hasta 1h (activa el "Modo desarrollador" en Discord y haz clic derecho sobre el servidor > Copiar ID).
   - `OWNER_DISCORD_ID`: tu ID de usuario de Discord. Es el único que podrá usar `/permitir`, `/revocar` y `/permitidos`.

   Nunca compartas el contenido de `.env`.

3. Invita el bot a tu servidor con estos permisos (OAuth2 > URL Generator, scopes `bot` y `applications.commands`):
   - Send Messages
   - Attach Files
   - Use Slash Commands
   - Read Message History (opcional, útil para depurar)

   El bot **no necesita** ningún intent privilegiado (no lee mensajes, solo interacciones y usuarios), así que no hace falta activar "Message Content Intent" ni "Server Members Intent" en el portal.

## 3. Instalación

```bash
npm install
npm run db:generate
npm run db:migrate     # crea las tablas (te pedirá un nombre para la migración)
npm run db:seed        # crea el usuario admin y un perfil de empresa de ejemplo
```

## 4. Arrancar en desarrollo

En dos terminales:

```bash
npm run dev:web    # http://localhost:3000
npm run dev:bot    # conecta el bot a Discord
```

Antes de poder usar los comandos por primera vez (o cada vez que cambies sus
opciones/descripciones), registra los slash commands:

```bash
npm run deploy:commands
```

## 5. Primeros pasos

1. Entra en `http://localhost:3000/login` con el usuario/contraseña del `.env`.
2. Ve a **Empresa** y rellena tus datos fiscales, IBAN y logo — aparecerán en los PDF.
3. Crea al menos un **Cliente**.
4. Crea una **Factura** o **Presupuesto**: añade líneas, revisa el total calculado
   automáticamente y guarda. Podrás previsualizar y descargar el PDF desde su
   página de detalle.
5. Un presupuesto se puede **convertir a factura** con un clic, generando un
   nuevo número de factura y copiando las líneas.

## 6. Uso del bot en Discord

- `/factura numero:FAC-2026-0001` — publica el PDF en el canal donde escribes.
- `/factura numero:FAC-2026-0001 usuario:@alguien` — se lo envía por DM (debe compartir servidor con el bot).
- `/presupuesto numero:PRE-2026-0001 [usuario]` — igual, para presupuestos.
- `/permitir usuario:@alguien` — (solo tú, el dueño) añade a alguien a la lista de permitidos.
- `/revocar usuario:@alguien` — (solo tú) le quita el permiso.
- `/permitidos` — (solo tú) lista quién tiene acceso.

Cualquier otro usuario que no esté en la lista de permitidos (ni sea el dueño)
recibirá un aviso de que no tiene permiso al intentar usar `/factura` o `/presupuesto`.

## 7. Ejecutar 24/7 en un servidor Ubuntu (producción)

Usamos [PM2](https://pm2.keymetrics.io/) para mantener la web y el bot siempre
vivos, con reinicio automático si se caen y arranque automático al reiniciar
el servidor. El archivo `ecosystem.config.js` (en la raíz) ya define ambos procesos.

### 7.1 Preparar el servidor (una sola vez)

```bash
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL (si no usas uno externo/gestionado)
sudo apt-get install -y mysql-server

# PM2, global
sudo npm install -g pm2
```

### 7.2 Subir y configurar el proyecto

```bash
git clone <tu-repositorio> /opt/facturadiscord   # o sube el código por scp/rsync
cd /opt/facturadiscord

npm ci                     # instala dependencias exactas (usa package-lock.json)
cp .env.example .env
nano .env                  # rellena DATABASE_URL, SESSION_SECRET, DISCORD_*, etc.

npm run db:generate
npm run db:migrate         # aplica el esquema a tu MySQL de producción
npm run db:seed            # crea el usuario admin y el perfil de empresa

npm run build               # compila la web (Next.js) y el bot (TypeScript)
npm run deploy:commands     # registra los slash commands en Discord
```

### 7.3 Arrancar con PM2 y dejarlo persistente

```bash
pm2 start ecosystem.config.js
pm2 save                    # guarda la lista de procesos actual
pm2 startup                 # imprime un comando "sudo env PATH=... pm2 startup ..."
                             # cópialo y ejecútalo tal cual para que PM2 arranque en el boot
```

A partir de aquí, `facturadiscord-web` y `facturadiscord-bot` seguirán
funcionando aunque cierres la sesión SSH, se caiga el proceso, o se reinicie
la máquina.

Comandos útiles del día a día:

```bash
pm2 status                      # ver si están arriba
pm2 logs                        # logs en vivo de ambos (Ctrl+C para salir)
pm2 logs facturadiscord-bot     # logs solo del bot
pm2 restart all                 # reiniciar ambos (p. ej. tras cambiar el .env)
pm2 restart facturadiscord-web  # reiniciar solo uno
pm2 monit                       # panel de CPU/memoria en vivo
```

### 7.4 Exponer la web con dominio y HTTPS (opcional pero recomendado)

Next.js corre en el puerto 3000; ponle un reverse proxy con Nginx delante:

```nginx
# /etc/nginx/sites-available/facturadiscord
server {
    listen 80;
    server_name factura.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/facturadiscord /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# HTTPS gratis con Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d factura.tudominio.com
```

Y abre el firewall si usas `ufw`:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

El bot no necesita ningún puerto abierto: se conecta él mismo a Discord.

### 7.5 Actualizar a una nueva versión

```bash
cd /opt/facturadiscord
git pull                    # o vuelve a subir el código actualizado
npm ci
npm run db:migrate          # si hay cambios en el esquema
npm run build
npm run deploy:commands     # solo si cambiaste comandos del bot
pm2 restart all
```
