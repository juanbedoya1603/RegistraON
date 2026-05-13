from fastapi import HTTPException
from infrastructure.repositories import product_repository
from schemas import ProductSaveRequest

NO_MEASURE_PRODUCTS = [
    # Aseo y Hogar
    "ESCOBA", "TRAPEADOR", "RECOGEDOR", "BALDE", "ESPONJA", "CEPILLO",
    "GUANTE", "MOPA", "CHURRUSCO", "BRILLO", "PLUMERO", "TRAPERA",
    "DISPENSADOR", "ESCOBILLA", "ESCOBILLON", "CEPILLON", "LIMPION",
    "PAÑO", "TRAPO", "FRANELA", "REPUESTO", "MANGO", "ATOMIZADOR",
    "ROCIADOR", "CANASTA", "CESTO", "PAPELERA", "BASURERO", "BOLSA",
    "ORGANIZADOR", "PERCHA", "GANCHO", "COLGADOR", "TENDEDERO", "PRENSA",
    "CANASTILLA", "PORTAESCOBA", "PORTATRAPERO", "PORTARROLLO", "JABONERA",
    "CEPILLERA", "REJILLA", "DESTAPADOR", "CAUCHO", "CHUPA", "SOPAPA",
    "BAYETILLA", "SECADOR", "ESCURRIDOR", "VENTOSA", "LAVAPLATOS",

    # Bazar y Cocina
    "VASO", "PLATO", "TAZA", "CUCHARA", "TENEDOR", "CUCHILLO", "CUBIERTO",
    "OLLA", "SARTEN", "JARRA", "TUPPER", "RECIPIENTE", "COLADOR",
    "EXPRIMIDOR", "RALLADOR", "TABLA", "MOLDE", "BOWL", "BANDEJA",
    "ENSALADERA", "SALERO", "PIMENTERO", "AZUCARERA", "SERVILLETERO",
    "PORTAVASO", "POSAVASO", "INDIVIDUAL", "MANTEL", "DELANTAL",
    "AGARRADERA", "ESPATULA", "CUCHARON", "BATIDOR", "PELADOR",
    "ABRELATAS", "SACACORCHO", "EMBUDO", "TAMIZ", "CERNIDOR",
    "MACHACADOR", "MORTERO", "RODILLO", "CORTADOR", "PICADOR",
    "MANDOLINA", "TORTILLERO", "AREPERA", "HIELERA", "CUBETA",
    "TERMO", "LONCHERA", "PORTACOMIDA", "PORTAVIANDA", "PANERA",
    "FRUTERO", "PORTACUBIERTO", "PORTAOLLA", "POSAOLLA", "BASE",
    "TAPA", "COPA", "COPITA", "POCILLO", "MUG", "TETERA",
    "CAFETERA", "GRECA", "OLLETA", "CALDERO", "PARRILLA",
    "ASADOR", "BROCHETA", "PALILLO", "MEZCLADOR",

    # Cuidado Personal
    "PRESTOBARBA", "AFEITADORA", "PEINILLA", "PEINE", "CORTAUÑAS",
    "LIMA", "PINZA", "GORRO", "ESPEJO", "RIZADOR", "PLANCHA",
    "DIFUSOR", "BOQUILLA", "TIJERA", "CORTADORA", "DEPILADOR",
    "ENCRESPADOR", "SEPARADOR", "BANDA", "BALACA", "DIADEMA",
    "COLETERO", "HEBILLA", "MOÑA", "BAMBA", "TURBANTE",
    "PORTACEPILLO", "ESTUCHE", "COSMETIQUERA", "NECESER", "POMEZ",

    # Papeleria
    "CUADERNO", "LAPIZ", "ESFERO", "BOLIGRAFO", "BORRADOR", "SACAPUNTAS",
    "REGLA", "MARCADOR", "CARPETA", "BLOCK", "LIBRETA", "CLIP",
    "CHINCHE", "RESALTADOR", "MICROPUNTA", "PLUMON", "CRAYON",
    "COLOR", "PORTAMINA", "MINA", "COMPAS", "TRANSPORTADOR",
    "ESCUADRA", "CARTUCHERA", "LAPICERO", "PORTALAPIZ", "AGENDA",
    "PLANIFICADOR", "CALENDARIO", "ARCHIVADOR", "FOLDER", "SOBRE",
    "ETIQUETA", "STICKER", "TACO", "TARJETA", "CARTULINA",
    "PAPEL", "HOJA", "BLOC", "CINTA", "GRAPADORA", "GRAPA",
    "PERFORADORA", "SACAGRAPA", "BISTURI", "CUTTER", "TABLERO",
    "PORTADOCUMENTO", "PINCEL", "PALETA", "SELLO", "TAMPON",
    "HUMEDECEDOR", "PUNZON", "LIBRO",

    # Ferreteria y Electricos
    "BOMBILLO", "LINTERNA", "PILA", "BATERIA", "CANDADO", "DESTORNILLADOR",
    "MARTILLO", "ALICATE", "ENCHUFE", "TOMACORRIENTE", "EXTENSION", "CABLE",
    "CANDELA", "CANDELABRO", "VELA", "VELON", "CARGADOR", "ADAPTADOR",
    "MULTITOMA", "REGLETA", "INTERRUPTOR", "SOQUETE", "PLAFON",
    "PORTALAMPARA", "FOCO", "LAMPARA", "LAMPARILLA", "REFLECTOR",
    "TIMBRE", "FUSIBLE", "BREAKER", "CANALETA", "CLAVIJA",
    "CONECTOR", "TERMINAL", "CAIMAN", "TESTER", "MULTIMETRO",
    "BUSCAPOLO", "PROBADOR", "LLAVE", "BRISTOL", "ALLEN",
    "ALICATIN", "CORTAFRIO", "SEGUETA", "SERRUCHO", "SERRUCHA",
    "FORMON", "CINCEL", "PALA", "RASTRILLO", "AZADON",
    "PICO", "BARRA", "METRO", "FLEXOMETRO", "NIVEL",
    "PLOMADA", "BROCA", "PUNTA", "PUNTILLA", "CLAVO",
    "TORNILLO", "TUERCA", "ARANDELA", "CHAZO", "TARUGO",
    "REMACHE", "ARMELLA", "ARGOLLA", "CADENA", "MOSQUETON",
    "BISAGRA", "PASADOR", "PICAPORTE", "CERROJO", "MANIJA",
    "CHAPA", "RUEDA", "RODACHIN", "LIJA", "LLANA",
    "BROCHA", "MASCARA", "CARETA", "CASCO", "CHALECO",
    "GAFAS", "TAPON",

    # Textiles y Ropa
    "TOALLA", "SABANA", "COBIJA", "ALMOHADA", "CAMISETA", "PANTALON",
    "MEDIA", "CAMISA", "BLUSA", "CHAQUETA", "SACO", "BUSO",
    "SUETER", "VESTIDO", "FALDA", "SHORT", "BERMUDA", "INTERIOR",
    "BOXER", "BRASIER", "TOP", "PIJAMA", "BATA", "UNIFORME",
    "PANTALETA", "CALZONCILLO", "LICRA", "LEGGING", "SUDADERA",
    "GORRA", "SOMBRERO", "VISERA", "BUFANDA", "CORREA",
    "CINTURON", "TIRANTA", "PAÑUELO", "BOLSO", "MORRAL",
    "MALETA", "CARTERA", "MONEDERO", "BILLETERA", "ZAPATO",
    "CHANCLA", "SANDALIA", "TENIS", "BOTA", "PLANTILLA",
    "CORDON", "COJIN", "FUNDA", "COBERTOR", "CORTINA",
    "TAPETE", "ALFOMBRA", "SERVILLETA",

    # Bebe
    "CHUPO", "TETERO", "BABERO", "SONAJERO", "MORDEDOR", "RASCADOR",
    "PELELA", "BACINILLA", "ENTRENADOR", "CAMBIADOR", "COCHE",
    "CORRAL", "ANDADOR", "CANGURO", "PORTABEBE", "MOSQUITERO",
    "TERMOMETRO", "ESQUINERO",

    # Fiestas y Decoracion
    "GLOBO", "PIÑATA", "ANTIFAZ", "SERPENTINA", "CONFETI", "GUIRNALDA",
    "FESTON", "BANDERIN", "LETRERO", "CORONA", "SILBATO",
    "PITO", "PORTAVELA", "BENGALA", "INVITACION", "TOPPER",
    "FIGURA", "ADORNO", "MOÑO", "REGALO",

    # Vehiculos
    "CONTROL", "PARAGUAS", "SOMBRILLA", "ENCENDEDOR", "FOSFORO",
    "AMBIENTADOR", "PARASOL", "RETROVISOR", "PORTACELULAR",
    "ANTENA", "PLUMILLA", "LIMPIABRISAS", "RASQUETA", "TRIANGULO",
    "GATO", "CRUCETA", "MANOMETRO", "INFLADOR", "COMPRESOR",
    "SOPORTE", "PORTAPLACA", "VALVULA", "IMPERMEABLE",

    # Mascotas
    "COLLAR", "ARNES", "BOZAL", "PLACA", "CAMA", "CASA",
    "GUACAL", "TRANSPORTADOR", "JAULA", "PECERA", "BEBEDERO",
    "COMEDERO", "JUGUETE", "PELOTA", "HUESO", "CUERDA",
    "ARENERO", "CASCABEL",

    # Electronica y Accesorios
    "AUDIFONO", "PARLANTE", "MOUSE", "TECLADO", "MEMORIA", "USB",
    "MICROSD", "HUB", "HDMI", "AUXILIAR", "PROTECTOR",
    "TRIPODE", "REGULADOR", "UPS", "CAMARA", "WEBCAM",
    "MICROFONO", "CALCULADORA",

    # Jardineria y Exterior
    "MATERA", "MACETA", "REGADERA", "PODADORA", "MANGUERA",
    "ASPERSOR", "ESTACA", "ANTORCHA", "HAMACA", "CARPA",

    # Organizacion y Almacenamiento
    "CAJA", "CAJON", "CAJONERA", "CANASTO", "CONTENEDOR", "BAUL",
    "ESTANTE", "REPISA", "DIVISOR", "PERCHERO", "ZAPATERA",
    "ROPERA", "PORTAOBJETO", "PORTALLAVE", "LLAVERO", "CUBO"
]

def process_and_save_product(cursor, product: ProductSaveRequest):
    # REGLA DE NEGOCIO: Límite diario de 5 productos por operario
    daily_count = product_repository.get_daily_registration_count(cursor, product.numDocument)
    if daily_count >= 5:
        raise HTTPException(
            status_code=403, 
            detail="LÍMITE DIARIO ALCANZADO: Ya has registrado el máximo de 5 productos por hoy."
        )

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
