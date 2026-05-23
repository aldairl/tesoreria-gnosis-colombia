from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


class Organizacion(BaseModel):
    diocesis: str
    santuario: str
    codigo_santuario: int = Field(ge=1, le=99)
    mes_anio: date  # day is ignored; only month+year used


class CuentaVaria(BaseModel):
    detalle: str
    valor: float = Field(ge=0)


class Miembro(BaseModel):
    nombre: str
    cedula: int
    aportes: float = Field(gt=0)
    num_cuotas: int = Field(default=1, ge=1)
    fecha_recibo: date
    num_recibo: str
    cuentas_varias: list[CuentaVaria] = Field(default_factory=list, max_length=3)


class OtraEntrada(BaseModel):
    concepto: str
    valor: float = Field(ge=0)


class SalidaAdminItem(BaseModel):
    fecha: Optional[date] = None
    valor: float = Field(default=0, ge=0)


class SalidaItem(BaseModel):
    concepto: str
    valor: float = Field(default=0, ge=0)


class ActividadLumisial(BaseModel):
    concepto: str
    valor: float = Field(ge=0)


class CuadreCaja(BaseModel):
    recibo_desde: int
    recibo_hasta: int
    voucher_desde: int
    voucher_hasta: int
    saldo_anterior: float = Field(ge=0)
    obolo: float = Field(ge=0)
    cuentas_por_pagar: float = Field(default=0, ge=0)


CONCEPTOS_ADMIN = [
    "Impuesto predial",
    "Servicio Telefonía e Internet",
    "Servicio Público de Agua",
    "Servicio Público de Energía",
    "Servicio Público de Gas",
    "Arriendo/ Pago cuota Lumisial",
    "",
]

CONCEPTOS_LUMISIAL = [
    "FLORES",
    "UVAS",
    "COPAS",
    "OASIS",
    "VELAS",
    "ACEITE",
    "CARBON",
    "PAN",
]


class TesoreríaData(BaseModel):
    organizacion: Organizacion
    miembros: list[Miembro] = Field(max_length=150)
    otras_entradas: list[OtraEntrada] = Field(default_factory=list, max_length=15)
    salidas_admin: list[SalidaAdminItem] = Field(default_factory=list, max_length=7)
    salidas_1008: list[SalidaItem] = Field(default_factory=list, max_length=16)
    salidas_lumisial: list[SalidaItem] = Field(default_factory=list, max_length=25)
    actividades_lumisial: list[ActividadLumisial] = Field(default_factory=list)
    cuadre_caja: CuadreCaja
