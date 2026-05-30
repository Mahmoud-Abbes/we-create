# Keycloak assets

Everything Keycloak-related for local Docker lives in this folder.

## Layout

```
keycloak/
  providers/          # SPI extensions mounted into the Keycloak container
  themes/             # Custom login themes (mounted to /opt/keycloak/themes)
    wecreate-theme/
  README.md
```

## Login theme

The `wecreate-theme` login theme extends **keycloak.v2** with custom templates, CSS, and messages.

`themes/wecreate-theme/login/theme.properties` contains `import=common/keycloak`. That is **not** a local folder — it tells Keycloak to inherit built-in resources from the stock `common/keycloak` theme inside the Keycloak image. Keep that line.

## Apply the theme

1. Open Keycloak Admin: `http://localhost:8081/auth` (or `http://localhost/auth` via nginx).
2. Select realm **we-create**.
3. Go to **Realm settings** → **Themes**.
4. Set **Login theme** to `wecreate-theme`.
5. Save.
6. Restart Keycloak:

```bash
docker compose restart keycloak
```

## Docker mounts

`docker-compose.yml` mounts:

- `./keycloak/providers/email-otp-authenticator-v1.3.5-kc-26.5.4.jar` → email OTP authenticator
- `./keycloak/themes` → `/opt/keycloak/themes`
