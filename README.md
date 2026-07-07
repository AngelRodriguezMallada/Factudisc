# factuRM

Plataforma **multi-cuenta** para emitir facturas y presupuestos profesionales, más
un bot de Discord que publica esos PDFs bajo demanda. Cada **owner** gestiona su
propia cuenta (empresa, clientes, documentos, métodos de pago) desde la web o desde
su servidor de Discord. Un **super-admin** crea las cuentas y da acceso.

- **Super-admin**: crea cuentas y asigna owners/acceso; no ve el contenido ajeno.
- **Owner**: control total de su cuenta; enlaza sus servidores y gestiona miembros.
- **Miembro**: puede emitir/consultar documentos de la cuenta.

El login web es con **Discord (OAuth)** o con **usuario y contraseña** (las asigna
el super-admin al crear la cuenta, o cada usuario en su página de Empresa). Con
Discord la identidad coincide con la del bot.

## Estructura

```
apps/web     Next.js — panel de facturación (login Discord, clientes, empresa, documentos, admin)
apps/bot     Bot de Discord (discord.js) — /factura, /presupuesto, /convertir, /vincular, /permitir, /crear-cuenta…
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
   - `SESSION_SECRET`: cadena aleatoria larga, mínimo 32 caracteres (`openssl rand -hex 32`).
   - `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`: del Developer Portal (pestaña "OAuth2").
   - `DISCORD_OAUTH_REDIRECT_URI`: URL de retorno del login, p. ej. `https://tu-dominio.com/api/auth/discord/callback` (en local `http://localhost:3000/api/auth/discord/callback`). **Debe estar dada de alta** en OAuth2 > Redirects.
   - `DISCORD_TOKEN`: token del bot (pestaña "Bot").
   - `DISCORD_GUILD_ID` (opcional): ID de tu servidor de pruebas, para que los comandos se registren al instante en vez de esperar hasta 1h.
   - `SUPER_ADMIN_DISCORD_ID`: tu ID de usuario de Discord. Es el único que puede crear cuentas y dar acceso (`/crear-cuenta`, `/listar-cuentas` y el panel `/admin`).

   Nunca compartas el contenido de `.env`.

3. En el Developer Portal, pestaña **OAuth2 > Redirects**, añade la misma URL de `DISCORD_OAUTH_REDIRECT_URI`.

4. Invita el bot a tu servidor con estos permisos (OAuth2 > URL Generator, scopes `bot` y `applications.commands`):
   - Send Messages
   - Attach Files
   - Use Slash Commands
   - Read Message History (opcional, útil para depurar)

   El bot **no necesita** ningún intent privilegiado (no lee mensajes, solo interacciones y usuarios), así que no hace falta activar "Message Content Intent" ni "Server Members Intent" en el portal.

## 3. Instalación

```bash
npm install
npm run db:generate
npm run db:migrate     # crea/actualiza las tablas (te pedirá un nombre si hay cambios de esquema nuevos)
npm run db:seed        # crea la cuenta principal, te asigna como super-admin (owner) y un perfil de empresa de ejemplo
```

> `db:migrate` (`prisma migrate dev`) necesita que el usuario de MySQL pueda
> crear una base de datos temporal ("shadow database") para comparar el
> esquema — normal en local con un usuario con privilegios amplios (p. ej.
> `root`). En producción, con un usuario más restringido, usa `npm run
> db:deploy` en su lugar (ver sección 7.2).

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

1. Entra en `http://localhost:3000/login` con **Discord** o con **usuario y
   contraseña** (si definiste `SUPER_ADMIN_USERNAME`/`SUPER_ADMIN_PASSWORD` en el
   `.env`, el seed te las asigna). Como super-admin verás tu cuenta principal y el
   panel **Admin**.
2. Desde **Admin** (o con `/crear-cuenta` en el bot) crea cuentas para otros owners
   indicando su ID de Discord y, opcionalmente, un usuario/contraseña. Cada owner
   entrará con Discord o con esas credenciales y verá solo lo suyo. También puede
   cambiar sus credenciales en **Empresa**.
3. Como owner, ve a **Empresa**: rellena tus datos fiscales, IBAN y logo, y añade
   tus **métodos de pago** (transferencia, PayPal, Bizum…).
4. Crea al menos un **Cliente**.
5. Crea una **Factura** o **Presupuesto**: añade líneas (precios con hasta 4
   decimales), elige qué métodos de pago mostrar y guarda. Previsualiza/descarga
   el PDF desde su detalle.
6. Un presupuesto se puede **convertir a factura** con un clic (o con `/convertir`
   en el bot), copiando líneas y métodos de pago.

## 6. Uso del bot en Discord

Facturación (cualquier miembro de la cuenta del servidor):
- `/factura numero:FAC-2026-0001 [usuario]` — publica el PDF en el canal (o por DM si indicas `usuario`).
- `/presupuesto numero:PRE-2026-0001 [usuario]` — igual, para presupuestos.
- `/convertir numero:PRE-2026-0001 [usuario]` — convierte el presupuesto en factura y publica el PDF.

Los campos `numero` tienen **autocompletado** con los documentos de la cuenta.

Gestión de la cuenta (owner):
- `/vincular` — vincula el servidor actual a tu cuenta (necesario antes de usar los comandos de facturación aquí).
- `/desvincular` — desvincula el servidor.
- `/permitir usuario:@alguien` — da acceso a un miembro; `/revocar usuario:@alguien` se lo quita.
- `/miembros` — lista quién tiene acceso a la cuenta.

Plataforma (super-admin):
- `/crear-cuenta nombre:… owner:@alguien` — crea una cuenta y asigna su owner.
- `/listar-cuentas` — lista las cuentas de la plataforma.

Un servidor solo funciona tras `/vincular`; quien no sea miembro de la cuenta recibe un aviso.

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
npm run db:deploy          # aplica las migraciones ya generadas (no necesita crear shadow database)
npm run db:seed            # crea la cuenta principal, el super-admin y el perfil de empresa

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

### 7.4 Exponer la web con dominio y HTTPS (Apache)

Next.js corre en el puerto 3000; Apache actúa de reverse proxy delante con `mod_proxy`.

```bash
sudo a2enmod proxy proxy_http headers rewrite
sudo systemctl restart apache2
```

VirtualHost `:80` (solo redirige a HTTPS, certbot lo genera/ajusta si usas `--apache`):

```apache
<VirtualHost *:80>
    ServerName factura.tudominio.com
    ServerAlias www.factura.tudominio.com

    ErrorLog ${APACHE_LOG_DIR}/facturadiscord_error.log
    CustomLog ${APACHE_LOG_DIR}/facturadiscord_access.log combined

    RewriteEngine on
    RewriteCond %{SERVER_NAME} =factura.tudominio.com [OR]
    RewriteCond %{SERVER_NAME} =www.factura.tudominio.com
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
```

VirtualHost `:443` (creado por certbot, `factura.tudominio.com-le-ssl.conf`) — añade el proxy dentro, sin tocar las líneas `SSLEngine`/`SSLCertificateFile`/`SSLCertificateKeyFile`:

```apache
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
    RequestHeader set X-Forwarded-Proto "https"
```

```bash
sudo apachectl configtest
sudo systemctl reload apache2

# HTTPS gratis con Let's Encrypt
sudo apt-get install -y certbot python3-certbot-apache
sudo certbot --apache -d factura.tudominio.com -d www.factura.tudominio.com
```

Y abre el firewall si usas `ufw`:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Apache Full'
sudo ufw enable
```

El bot no necesita ningún puerto abierto: se conecta él mismo a Discord.

### 7.5 Actualizar a una nueva versión

```bash
cd /opt/facturadiscord
git pull                    # o vuelve a subir el código actualizado
npm ci
npm run db:deploy           # aplica migraciones nuevas si las hay
npm run build
npm run deploy:commands     # solo si cambiaste comandos del bot
pm2 restart all
```
