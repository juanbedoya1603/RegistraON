from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import scanner

app = FastAPI(title="RegistraON API")



# Configuración del guardia de fronteras (CORS)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conectar las rutas
app.include_router(scanner.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "API de RegistraON funcionando"}
