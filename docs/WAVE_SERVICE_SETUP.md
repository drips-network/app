# 🌊 Wave Service Setup

The **Wave** service is a component of the Drips stack that handles GitHub integrations. To run it locally, you need to configure a GitHub App and provide its credentials to the service via environment variables.

## 📋 Prerequisites

- Ensure you have followed the [Quick Start guide in DEVELOPMENT.md](./DEVELOPMENT.md) to set up the general development environment.
- You will need a GitHub account to create a GitHub App.

## 🛠️ GitHub App Configuration

To fully utilize the Wave service locally, you must create a GitHub App.

1.  **Create a New GitHub App**:
    - Go to [GitHub Developer Settings > GitHub Apps](https://github.com/settings/apps).
    - Click **New GitHub App**.

2.  **Basic Information**:
    - **GitHub App Name**: Choose a unique name (e.g., `drips-wave-local-<yourname>`).
    - **Homepage URL**: `http://localhost:5173` (or your local frontend URL).
    - **Callback URL**:
        - **Option A (Localhost)**: `http://localhost:8000/api/auth/github/callback`
        - **Option B (Static Tunnel)**: `https://<your-domain>/api/auth/github/callback`
        - *Note: This must match the `GITHUB_OAUTH_CALLBACK_URL` configured in `docker-compose.yml` (via `WAVE_PUBLIC_URL`).*
    - **Webhook URL**:
        - **Option A (Quick Tunnel - Random URL)**:
            - Leave `CLOUDFLARED_TUNNEL_TOKEN` empty in your `.env`.
            - The Wave service will automatically detect the random URL on startup.
            - Check logs for the URL: `docker compose logs wave | grep "Found Tunnel URL"`
            - Example: `https://<random>.trycloudflare.com/api/webhooks/github`
        - **Option B (Static Tunnel - Fixed URL)**:
            - Set `CLOUDFLARED_TUNNEL_TOKEN` in your `.env` (see instructions below).
            - Use your configured domain: `https://<your-domain>/api/webhooks/github`
        - *Active*: Check this box.

3.  **Permissions and Events**:
    - Configure the following permissions (adjust based on specific development needs, but these are standard for Drips integrations):
        - **Repository permissions**:
            - `Contents`: Read-only (to read `FUNDING.json` etc.)
            - `Metadata`: Read-only
            - `Pull requests`: Read & Write (if the bot needs to comment or merge)
            - `Issues`: Read & Write
        - **Organization permissions**:
            - `Members`: Read-only
        - **Account permissions**:
            - `Email addresses`: Read-only
    - Configure the following events:
        - `Installation target`
        - `Issues`
        - `Organization`
        - `Membership`
        - `Repository`

4.  **Generate Client Secret**:
    - Scroll to the "Client secrets" section.
    - Click **Generate a new client secret**.
    - Copy this secret immediately (you won't see it again).

5.  **Generate Private Key**:
    - (After saving the app, you will be prompted to generate a private key.)
    - Scroll down to "Private keys" and click **Generate a private key**.
    - This will download a `.pem` file. You will need the contents of this file.

6.  **Install the App**:
    - Go to **Install App** in the sidebar.
    - Install the app on your personal account or a test organization.

## ⚙️ Environment Variables

Once your GitHub App is created, you need to update your `.env` file (or set these variables in your shell) to match the `docker-compose.yml` requirements.

Open your `.env` file (create one from `.env.template` if you haven't already) and add/update the following:

```bash
# GitHub OAuth Configuration
GITHUB_OAUTH_CLIENT_ID=your_client_id_here
GITHUB_OAUTH_CLIENT_SECRET=your_client_secret_here

# GitHub App Configuration
GITHUB_APP_ID=your_app_id_here
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_APP_BOT_USER_ID=your_bot_user_id_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
```

### Where to find these values:

-   **`GITHUB_OAUTH_CLIENT_ID`**: Found on your GitHub App's "General" settings page (Client ID).
-   **`GITHUB_OAUTH_CLIENT_SECRET`**: Generate a new Client Secret on the "General" settings page.
-   **`GITHUB_APP_ID`**: Found on the "General" settings page (App ID).
-   **`GITHUB_APP_PRIVATE_KEY`**: The content of the `.pem` file you downloaded. **Important**: Ensure you preserve newlines or use `\n` if setting it as a single line string in some environments, though `.env` files usually handle multi-line strings if quoted properly.
-   **`GITHUB_APP_BOT_USER_ID`**: The unique numeric ID for your GitHub App's bot user.
    1.  **Find your App Slug**: On your App's public page (e.g. `https://github.com/apps/my-app`), the slug is the last part of the URL (`my-app`).
    2.  **Query the API**: Run `curl https://api.github.com/users/<slug>[bot]`.
        - Note: If using `curl` in Z sh/Bash, you may need to escape brackets or use URL encoding: `https://api.github.com/users/<slug>%5Bbot%5D`
    3.  **Get the ID**: Use the integer `id` field from the JSON response.
-   **`GITHUB_WEBHOOK_SECRET`**: The secret you set in the "Webhook URL" section (if you enabled webhooks). If you didn't set one, you can define any string here, but it must match what you configured in GitHub if webhooks are active.
-   **`CLOUDFLARED_TUNNEL_TOKEN`**: (Optional) Token for a persistent Cloudflare Tunnel. If set, the service will use this token to run a named tunnel with a static URL. If not set, it defaults to a random Quick Tunnel.
-   **`WAVE_PUBLIC_URL`**: (Optional) The public URL where your Wave service is accessible.
    -   **If set** (e.g. `http://localhost:8000`): The Cloudflare tunnel service will be **skipped**, and the Wave service will use this URL as its base.
    -   **If empty**: The Cloudflare tunnel service will start (either Quick or Named) and the URL will be automatically detected.

## 🚀 Running the Service

The Wave service is part of the standard Docker Compose stack.

```bash
npm run dev:docker
```

This command will start the `wave` service along with other dependencies. The service uses an event-driven startup script (`docker/wave-command.sh`) that waits for the Cloudflare URL if necessary, or starts immediately if `WAVE_PUBLIC_URL` is set.

You can check the logs:

```bash
docker compose logs -f wave
```

## 🌐 Webhook Integration (Cloudflared)

### Option 1: Localhost (No Tunnel)
If you don't need external webhooks (e.g. you're just clicking around the UI), you can skip the tunnel.

1.  Set `WAVE_PUBLIC_URL=http://localhost:8000` in your `.env`.
2.  Start the stack: `npm run dev:docker`.
3.  The `cloudflared` service will log "Skipping Cloudflare Tunnel startup" and exit.
4.  The `wave` service will start immediately with `BASE_URL=http://localhost:8000`.

### Option 2: Quick Tunnel (Random URL)
The default setup uses a Cloudflare Quick Tunnel, which generates a random URL each time.

1.  Leave `CLOUDFLARED_TUNNEL_TOKEN` **and** `WAVE_PUBLIC_URL` empty in `.env`.
2.  Start the stack: `npm run dev:docker`.
3.  The `cloudflared` service will start and generate a random URL.
4.  The `wave` service will detect this URL immediately via `inotify` and configure itself.
5.  Find your URL in the logs:
    ```bash
    docker compose logs wave | grep "Found Tunnel URL"
    ```
6.  On Github, update the GitHub App Webhook URL with this new URL.

### Option 3: Static Tunnel (Fixed URL)
For a persistent URL (e.g., `https://my-drips-dev.example.com`), use a Cloudflare Tunnel.

1.  **Create a Tunnel**:
    - Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
    - Navigate to **Networks > Tunnels**.
    - Create a new tunnel (select "Docker" environment to see the token, but you only need the token string).
2.  **Configure the Tunnel**:
    - In the "Public Hostname" tab of your tunnel, add a hostname (e.g., `wave-dev.yourdomain.com`).
    - Service: `HTTP` -> `wave:8000`.
3.  **Get the Token**:
    - Copy the token string from the install command (it's the long string after `--token`).
4.  **Update Environment**:
    - Add `CLOUDFLARED_TUNNEL_TOKEN=<your-token>` to your `.env` file.
    - Leave `WAVE_PUBLIC_URL` **empty** (or set it to your static URL if you want, but the auto-detection works with named tunnels too).
5.  **Restart**:
    - `npm run dev:docker`.
    - Your service is now available at your configured hostname.
    - The `GITHUB_OAUTH_CALLBACK_URL` will automatically update to use this URL.
