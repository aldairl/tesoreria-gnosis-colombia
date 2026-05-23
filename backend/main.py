from dotenv import load_dotenv

load_dotenv()

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from auth import LoginRequest, TokenResponse, authenticate, require_auth
from excel_generator import generate_excel
from models import TesoreríaData

app = FastAPI(title="Tesorería API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/login", response_model=TokenResponse)
def login(body: LoginRequest):
    return authenticate(body)


@app.post("/excel/generate")
def excel_generate(
    body: TesoreríaData,
    _: str = Depends(require_auth),
):
    buf = generate_excel(body)
    filename = f"tesoreria_{body.organizacion.mes_anio.strftime('%Y_%m')}.xlsm"
    return StreamingResponse(
        buf,
        media_type="application/vnd.ms-excel.sheet.macroEnabled.12",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
