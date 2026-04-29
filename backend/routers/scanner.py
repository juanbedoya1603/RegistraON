from fastapi import APIRouter, HTTPException, Path, Depends
import re
from database import get_db
from schemas import ProductSaveRequest
from infrastructure.repositories import product_repository
from services import product_service

router = APIRouter()

@router.get("/scan/{ean}")
async def scan_ean(
    ean: str = Path(..., description="EAN barcode (5-14 digits)"),
    conn = Depends(get_db)
):
    # 1. Validar formato (5-14 dígitos)
    if not re.match(r"^\d{5,14}$", ean):
        raise HTTPException(
            status_code=400, 
            detail="Formato de EAN inválido. Debe tener entre 5 y 14 dígitos."
        )
    
    cursor = conn.cursor()
    # --- TRIPLE-CHECK DE SEGURIDAD ---
    block_message = product_repository.validate_ean_is_free(cursor, ean)
    if block_message:
        return {"status": "error", "message": block_message}

    return {
        "status": "success",
        "message": "EAN libre"
    }

@router.get("/login/{cedula}")
async def login(
    cedula: str = Path(..., description="User ID document"),
    conn = Depends(get_db)
):
    cursor = conn.cursor()
    user_row = product_repository.get_user_by_cedula(cursor, cedula)
    
    if not user_row:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Registrar rastro de login
    product_repository.record_login_attempt(cursor, cedula)
    conn.commit()
    
    return {
        "status": "success",
        "user": {
            "name": user_row[0]
        }
    }

@router.post("/save")
async def save_product(
    product: ProductSaveRequest,
    conn = Depends(get_db)
):
    cursor = conn.cursor()
    # Delegamos la lógica de negocio a la capa de servicios
    response = product_service.process_and_save_product(cursor, product)
    conn.commit()
    return response

@router.get("/ranking")
async def get_ranking(conn = Depends(get_db)):
    cursor = conn.cursor()
    rows = product_repository.get_ranking(cursor)
    
    ranking = []
    for row in rows:
        ranking.append({
            "name": row[0],
            "minutes": int(row[1]) if row[1] is not None else 0
        })
    
    return ranking

@router.get("/user-stats/{cedula}")
async def get_user_stats(
    cedula: str = Path(..., description="User ID document"),
    conn = Depends(get_db)
):
    cursor = conn.cursor()
    # 1. Saldo Actual
    saldo = product_repository.get_user_balance(cursor, cedula)
    
    # 2. Actividad Reciente
    rows_history = product_repository.get_user_recent_history(cursor, cedula)
    
    history = []
    for row in rows_history:
        history.append({
            "ean": row[0],
            "fullName": row[1],
            "time": "+1 MIN"
        })
        
    return {
        "saldo": saldo,
        "history": history
    }

@router.get("/brands")
async def get_brands(conn = Depends(get_db)):
    cursor = conn.cursor()
    brands = product_repository.get_all_brands(cursor)
    return {"status": "success", "brands": brands}

@router.get("/base-products")
async def get_base_products_endpoint(conn = Depends(get_db)):
    cursor = conn.cursor()
    products = product_repository.get_base_products(cursor)
    return {"status": "success", "products": products}

@router.get("/config/no-measure-products")
async def get_no_measure_products(conn = Depends(get_db)):
    return {"status": "success", "products": product_service.NO_MEASURE_PRODUCTS}



