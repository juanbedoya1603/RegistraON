from fastapi import APIRouter, HTTPException, Path
import re
from database import get_connection
from schemas import ProductSaveRequest
from infrastructure.repositories import product_repository

router = APIRouter()

@router.get("/scan/{ean}")
async def scan_ean(ean: str = Path(..., description="EAN barcode (5-14 digits)")):
    # 1. Validar formato (5-14 dígitos)
    if not re.match(r"^\d{5,14}$", ean):
        raise HTTPException(
            status_code=400, 
            detail="Formato de EAN inválido. Debe tener entre 5 y 14 dígitos."
        )
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # --- TRIPLE-CHECK DE SEGURIDAD ---
        block_message = product_repository.validate_ean_is_free(cursor, ean)
        if block_message:
            return {"status": "error", "message": block_message}

    except Exception as e:
        print(f"Error de conexión general en scan: {e}")
        # No relanzamos aquí para no romper el flujo si es un error no crítico
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass

    return {
        "status": "success",
        "message": "EAN libre"
    }

@router.get("/login/{cedula}")
async def login(cedula: str = Path(..., description="User ID document")):
    conn = None
    try:
        conn = get_connection()
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
                "name": user_row[0],
                "lastName": user_row[1]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass

@router.post("/save")
async def save_product(product: ProductSaveRequest):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Regla 3: Convertir todos los campos a MAYÚSCULAS
        product_data = {
            "ean": product.ean.upper(),
            "fullName": product.fullName.upper(),
            "numDocument": product.numDocument.upper(),
            "nmProduct": product.nmProduct.upper(),
            "nmBrand": product.nmBrand.upper(),
            "nmCharacteristic": product.nmCharacteristic.upper(),
            "nmContentValue": product.nmContentValue.upper(),
            "nmContentUnit": product.nmContentUnit.upper(),
            "nmSalesUnit": product.nmSalesUnit.upper()
        }
        
        # REFUERZO: Validar EAN antes de guardar por seguridad absoluta
        block_message = product_repository.validate_ean_is_free(cursor, product_data['ean'])
        if block_message:
            raise HTTPException(status_code=400, detail=block_message)
            
        # Guardar usando el repositorio
        product_repository.save_product(cursor, product_data)
        conn.commit()
        
        return {"status": "success", "message": "Producto registrado exitosamente en RegistraON"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en save_product: {e}")
        raise HTTPException(status_code=500, detail=f"Error al guardar producto: {str(e)}")
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass

@router.get("/ranking")
async def get_ranking():
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        rows = product_repository.get_ranking(cursor)
        
        ranking = []
        for row in rows:
            ranking.append({
                "name": row[0],
                "minutes": int(row[1]) if row[1] is not None else 0
            })
        
        return ranking
        
    except Exception as e:
        print(f"Error en get_ranking: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener ranking: {str(e)}")
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass

@router.get("/user-stats/{cedula}")
async def get_user_stats(cedula: str = Path(..., description="User ID document")):
    conn = None
    try:
        conn = get_connection()
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
        
    except Exception as e:
        print(f"Error en get_user_stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener estadísticas del usuario: {str(e)}")
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass

@router.get("/brands")
async def get_brands():
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        brands = product_repository.get_all_brands(cursor)
        return {"status": "success", "brands": brands}
        
    except Exception as e:
        print(f"Error consultando marcas: {e}")
        return {"status": "success", "brands": []}
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass



