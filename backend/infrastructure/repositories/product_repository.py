import pyodbc

def validate_ean_is_free(cursor, ean: str) -> str:
    """
    Ejecuta el Doble-Check de seguridad.
    Retorna un string con el mensaje de error si está bloqueado, o None si está libre.
    """
    # 1. Chequeo en RegistraON (rpe.Products)
    cursor.execute("SELECT fullName FROM rpe.Products WHERE barCode = ?", (ean,))
    row = cursor.fetchone()
    if row:
        return f"BLOQUEO: El código ya existe en RegistraON como '{row[0]}'."

    # 2. Chequeo en TryTiendas.FixProducts
    try:
        cursor.execute("SELECT pName FROM TryTiendas.FixProducts WHERE barCode = ? AND barCode NOT LIKE 'TC%'", (ean,))
        row = cursor.fetchone()
        if row:
            return f"BLOQUEO: El código ya existe en FixProducts como '{row[0]}'."
    except Exception as e:
        print(f"Doble-Check (FixProducts) saltado por error técnico: {e}")

    return None # EAN Libre

def get_user_by_cedula(cursor, cedula: str):
    cursor.execute("SELECT name FROM rpe.UserUsers WHERE numDocument = ?", (cedula,))
    return cursor.fetchone()

def record_login_attempt(cursor, cedula: str):
    cursor.execute("INSERT INTO rpe.trackLogin (numDocument) VALUES (?)", (cedula,))

def save_product(cursor, product_data: dict):
    query = """
    INSERT INTO rpe.Products 
    (barCode, fullName, numDocument, timeEarned, nmProduct, nmBrand, nmCharacteristic, nmContentValue, nmContentUnit, nmSalesUnit) 
    VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
    """
    cursor.execute(query, (
        product_data['ean'], 
        product_data['fullName'], 
        product_data['numDocument'], 
        product_data['nmProduct'], 
        product_data['nmBrand'], 
        product_data['nmCharacteristic'], 
        product_data['nmContentValue'], 
        product_data['nmContentUnit'], 
        product_data['nmSalesUnit']
    ))

def get_ranking(cursor):
    query = """
    SELECT TOP 5 
        u.name as name, 
        (
            SELECT CASE WHEN (
                (SELECT ISNULL(SUM(timeEarned), 0) FROM rpe.Products WHERE numDocument = u.numDocument) - 
                (SELECT ISNULL(SUM(minutesRedeemed), 0) FROM rpe.TimeRedemptions WHERE numDocument = u.numDocument)
            ) < 0 THEN 0 ELSE (
                (SELECT ISNULL(SUM(timeEarned), 0) FROM rpe.Products WHERE numDocument = u.numDocument) - 
                (SELECT ISNULL(SUM(minutesRedeemed), 0) FROM rpe.TimeRedemptions WHERE numDocument = u.numDocument)
            ) END
        ) as minutes 
    FROM rpe.UserUsers u 
    WHERE EXISTS (SELECT 1 FROM rpe.Products WHERE numDocument = u.numDocument)
    ORDER BY minutes DESC
    """
    cursor.execute(query)
    return cursor.fetchall()

def get_user_balance(cursor, cedula: str) -> int:
    query = """
    SELECT 
        CASE WHEN (
            (SELECT ISNULL(SUM(timeEarned), 0) FROM rpe.Products WHERE numDocument = ?) - 
            (SELECT ISNULL(SUM(minutesRedeemed), 0) FROM rpe.TimeRedemptions WHERE numDocument = ?)
        ) < 0 THEN 0 ELSE (
            (SELECT ISNULL(SUM(timeEarned), 0) FROM rpe.Products WHERE numDocument = ?) - 
            (SELECT ISNULL(SUM(minutesRedeemed), 0) FROM rpe.TimeRedemptions WHERE numDocument = ?)
        ) END
    AS saldo
    """
    cursor.execute(query, (cedula, cedula, cedula, cedula))
    row = cursor.fetchone()
    return int(row[0]) if row and row[0] is not None else 0

def get_user_recent_history(cursor, cedula: str):
    query = """
    SELECT TOP 5 barCode, fullName, createdAt 
    FROM rpe.Products 
    WHERE numDocument = ? 
    ORDER BY createdAt DESC
    """
    cursor.execute(query, (cedula,))
    return cursor.fetchall()

def get_all_brands(cursor):
    cursor.execute("SELECT brName FROM TryTiendas.InvBrands ORDER BY brName ASC")
    return [row[0] for row in cursor.fetchall() if row[0]]

def get_base_products(cursor):
    query = "SELECT DISTINCT nmProduct FROM TryTiendas.FixProducts WHERE nmProduct IS NOT NULL ORDER BY nmProduct ASC"
    cursor.execute(query)
    return [row[0] for row in cursor.fetchall() if row[0]]
