from database import get_connection

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create schema rpe if it doesn't exist
    cursor.execute("IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'rpe') EXEC('CREATE SCHEMA rpe')")
    
    # Tabla rpe.UserUsers
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[rpe].[UserUsers]') AND type in (N'U'))
    CREATE TABLE rpe.UserUsers (
        numDocument VARCHAR(20) PRIMARY KEY,
        name VARCHAR(100),
        lastName VARCHAR(100)
    )
    """)
    
    # Tabla rpe.trackLogin
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[rpe].[trackLogin]') AND type in (N'U'))
    CREATE TABLE rpe.trackLogin (
        id INT PRIMARY KEY IDENTITY(1,1),
        numDocument VARCHAR(20) FOREIGN KEY REFERENCES rpe.UserUsers(numDocument),
        date DATETIME DEFAULT GETDATE()
    )
    """)
    
    # Tabla rpe.Products
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[rpe].[Products]') AND type in (N'U'))
    CREATE TABLE rpe.Products (
        id INT PRIMARY KEY IDENTITY(1,1),
        barCode VARCHAR(50) UNIQUE NOT NULL,
        fullName VARCHAR(255) NOT NULL,
        numDocument VARCHAR(20) FOREIGN KEY REFERENCES rpe.UserUsers(numDocument),
        timeEarned INT DEFAULT 1,
        nmProduct VARCHAR(100),
        nmBrand VARCHAR(100),
        nmCharacteristic VARCHAR(100),
        nmContentValue VARCHAR(50),
        nmContentUnit VARCHAR(20),
        nmSalesUnit VARCHAR(20),
        createdAt DATETIME DEFAULT GETDATE()
    )
    """)
    
    # Tabla rpe.TimeRedemptions
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[rpe].[TimeRedemptions]') AND type in (N'U'))
    CREATE TABLE rpe.TimeRedemptions (
        id INT PRIMARY KEY IDENTITY(1,1),
        numDocument VARCHAR(20) FOREIGN KEY REFERENCES rpe.UserUsers(numDocument),
        minutesRedeemed INT NOT NULL,
        redemptionDate DATETIME DEFAULT GETDATE(),
        authorizedBy VARCHAR(100) NOT NULL,
        notes VARCHAR(255)
    )
    """)
    
    conn.commit()
    conn.close()
    print("Database schema 'rpe' and tables initialized successfully.")

if __name__ == "__main__":
    try:
        init_db()
    except Exception as e:
        print(f"Error initializing database: {e}")
