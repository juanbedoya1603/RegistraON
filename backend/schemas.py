from pydantic import BaseModel
from typing import Optional

class ProductSaveRequest(BaseModel):
    ean: str
    fullName: str
    numDocument: str
    nmProduct: str
    nmBrand: str
    nmCharacteristic: str
    nmContentValue: str
    nmContentUnit: str
    nmSalesUnit: str

class UserResponse(BaseModel):
    name: str

class LoginResponse(BaseModel):
    status: str
    user: Optional[UserResponse] = None
    message: Optional[str] = None

class ScanResponse(BaseModel):
    status: str
    message: str
