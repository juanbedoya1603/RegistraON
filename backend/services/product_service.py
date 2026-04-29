from fastapi import HTTPException
from infrastructure.repositories import product_repository
from schemas import ProductSaveRequest

NO_MEASURE_PRODUCTS = [
    # Aseo y Hogar
    "ESCOBA", "TRAPEADOR", "RECOGEDOR", "BALDE", "ESPONJA", "CEPILLO", 
    "GUANTE", "MOPA", "CHURRUSCO", "BRILLO", "PLUMERO", "TRAPERA",
    
    # Bazar y Cocina
    "VASO", "PLATO", "TAZA", "CUCHARA", "TENEDOR", "CUCHILLO", "CUBIERTO", 
    "OLLA", "SARTEN", "JARRA", "TUPPER", "RECIPIENTE", "COLADOR", 
    "EXPRIMIDOR", "RALLADOR", "TABLA", "MOLDE",
    
    # Cuidado Personal
    "PRESTOBARBA", "AFEITADORA", "PEINILLA", "PEINE", "CORTAUÑAS", 
    "LIMA", "PINZA", "GORRO", "ESPEJO", "COPA MENSTRUAL", "CEPILLO DE DIENTES",
    
    # Papelería
    "CUADERNO", "LAPIZ", "ESFERO", "BOLIGRAFO", "BORRADOR", "SACAPUNTAS", 
    "REGLA", "MARCADOR", "CARPETA", "BLOCK", "LIBRETA", "TIJERA", "CLIPS", "CHINCHE",
    
    # Ferretería y Eléctricos
    "BOMBILLO", "LINTERNA", "PILA", "BATERIA", "CANDADO", "DESTORNILLADOR", 
    "MARTILLO", "ALICATE", "ENCHUFE", "TOMA CORRIENTE", "EXTENSION", "CABLE", 
    "CANDELA", "CANDELABRO", "VELA", "VELON",
    
    # Textiles, Bebé y Varios
    "TOALLA", "SABANA", "COBIJA", "ALMOHADA", "CAMISETA", "PANTALON", "MEDIA", 
    "CHUPO", "TETERO", "BABERO", "VELA", "GLOBO", "PIÑATA", "ANTIFAZ", 
    "PARAGUAS", "SOMBRILLA", "ENCENDEDOR", "FOSFORO"
]

def process_and_save_product(cursor, product: ProductSaveRequest):
    # Regla 3: Convertir todos los campos a MAYÚSCULAS
    product_data = {
        "ean": product.ean.upper(),
        "fullName": product.fullName.upper(),
        "numDocument": product.numDocument.upper(),
        "nmProduct": product.nmProduct.upper(),
        "nmBrand": product.nmBrand.upper(),
        "nmCharacteristic": product.nmCharacteristic.upper() if product.nmCharacteristic else "",
        "nmContentValue": product.nmContentValue.upper() if product.nmContentValue else "",
        "nmContentUnit": product.nmContentUnit.upper() if product.nmContentUnit else "",
        "nmSalesUnit": product.nmSalesUnit.upper() if product.nmSalesUnit else ""
    }

    # REGLA DE NEGOCIO 4: Quality Guard (Whitelist)
    is_no_measure = any(kw in product_data['nmProduct'] for kw in NO_MEASURE_PRODUCTS)

    if not is_no_measure and (not product_data['nmContentValue'] or not product_data['nmContentUnit']):
        raise HTTPException(
            status_code=400, 
            detail="QUALITY GUARD: El Contenido y la Unidad son obligatorios para este producto."
        )
    
    # REFUERZO: Validar EAN antes de guardar por seguridad absoluta
    block_message = product_repository.validate_ean_is_free(cursor, product_data['ean'])
    if block_message:
        raise HTTPException(status_code=400, detail=block_message)
        
    # Guardar usando el repositorio
    product_repository.save_product(cursor, product_data)
    
    return {"status": "success", "message": "Producto registrado exitosamente en RegistraON"}
