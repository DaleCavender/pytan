# pytan 🎲

**pytan** is a fast, web-based, real-time multiplayer implementation of the classic board game Catan. Powered by **FastAPI** and **WebSockets**, it provides a seamless, interactive, and responsive tabletop experience directly in your browser. 

---

## 🌟 Key Features

| Category | Features |
|---|---|
| **Gameplay** | Full standard ruleset including Longest Road, Largest Army, and Development Cards. |
| **Multiplayer** | Supports 2 to 6 players per lobby, complete with the extended board and Special Building Phase. |
| **Trading** | Advanced trading UI supporting both Inter-player proposals and Bank/Port exchanges. |
| **Social** | Real-time chat with automatic inline rendering for image and GIF links. |
| **Visuals** | Dynamic board rendering, pop-in dice, and real-time floating card indicators (+1/-1). |

---

## 🚀 Quick Start (Local Development)

The easiest way to run **pytan** locally is using the provided Docker management script. 

### Requirements
* Docker & Docker Compose
* Alternatively: Python 3.11+

### Running via Docker

| Command | Action |
|---|---|
| `./docker-mgmt.sh build` | Builds the catan-app Docker image. |
| `./docker-mgmt.sh run` | Starts the server on http://localhost:4567. |
| `./docker-mgmt.sh stop` | Gracefully stops the running container. |
| `./docker-mgmt.sh clean` | Removes the Docker image to free up space. |

### Running Manually
If you prefer to run the app without Docker:
1. Install dependencies: pip install -r requirements.txt
2. Start the Uvicorn server: uvicorn app.main:app --host 0.0.0.0 --port 4567
3. Navigate to http://localhost:4567/home

---

## 🌍 Production Deployment

When deploying **pytan** to a live server, it is highly recommended to sit the application behind a reverse proxy like **Nginx** or **Traefik** to handle SSL (HTTPS).

**Important Proxy Configuration:**
Because the game relies heavily on real-time WebSockets, your reverse proxy *must* be configured to forward the `Upgrade` and `Connection` headers. 

**Example Nginx Configuration:**
```nginx
server {
    listen 443 ssl;
    server_name play.yourdomain.com;

    # SSL configuration goes here...

    location / {
        proxy_pass http://localhost:4567;
        proxy_http_version 1.1;
        
        # Critical for WebSockets
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Note: The application automatically detects if it is being served over HTTPS and will correctly upgrade internal WebSocket connections to wss://.

## 🏗 Architecture & Current Limitations

| Limitation | Impact | Planned Resolution |
| --- | --- | --- |
| **In-Memory State** | Active game data is currently stored in a Python dictionary (ACTIVE_GAMES). | Implement Redis. |
| **Single Worker** | The app cannot be load-balanced across multiple Gunicorn/Uvicorn workers. | Implement Redis. |
| **Volatile Data** | Restarting the server will wipe all currently active game lobbies. | Implement Redis. |

*If deploying to production today, ensure Uvicorn is restricted to a single worker process.*

---

## 🗺 Roadmap

We are actively working on expanding the game. Here is what is coming next:

| Milestone | Description | Status |
| --- | --- | --- |
| **Base Game** | 2-6 player support, trading, chat, and core mechanics. | ✅ Complete |
| **State Management** | Migrate ACTIVE_GAMES to Redis for persistence and multi-worker scaling. | ⏳ Planned |
| **UI Polish** | Continuous improvements to animations, responsiveness, and mobile support. | ⏳ Planned |
| **Seafarers** | First major expansion: Ships, islands, gold fields, and new scenarios. | ⏳ Planned |
| **Cities & Knights** | Second major expansion: Cities, knights, barbarians, progress cards, and commodities. | ⏳ Planned |

## License

This project is licensed under the MIT License.

Copyright (c) 2020-Present, The pytan Contributors.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files. See the LICENSE file for full details.