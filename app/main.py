from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json

app = FastAPI()

# 1. Mount Static Files (CSS, JS, Images)
# This ensures that <script src="/js/main.js"> still works without changes.
app.mount("/js", StaticFiles(directory="static/js"), name="js")
app.mount("/css", StaticFiles(directory="static/css"), name="css")
app.mount("/images", StaticFiles(directory="static/images"), name="images")
app.mount("/fonts", StaticFiles(directory="static/fonts"), name="fonts")

# 2. Setup Template Engine
templates = Jinja2Templates(directory="templates")

# --- HTTP Routes ---

@app.get("/")
async def root():
    return RedirectResponse(url="/home")

@app.get("/home")
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request, "title": "Catan : Home"})

@app.get("/board")
async def board(request: Request):
    return templates.TemplateResponse("board.html", {"request": request, "title": "Play Catan"})

# --- WebSocket Endpoints ---

@app.websocket("/groups/")
async def websocket_groups(websocket: WebSocket):
    """Replaces GroupViewWebsocket.java for the lobby."""
    await websocket.accept()
    try:
        while True:
            # For now, just keep the connection alive
            data = await websocket.receive_text()
            if data == '"HEARTBEAT"':
                await websocket.send_text('"HEARTBEAT"')
    except WebSocketDisconnect:
        pass

@app.websocket("/action/")
async def websocket_action(websocket: WebSocket):
    """Replaces ReceivingWebsocket.java for in-game logic."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            # Logic for handle_action will go here
    except WebSocketDisconnect:
        pass
