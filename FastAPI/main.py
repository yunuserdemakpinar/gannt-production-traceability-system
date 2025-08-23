from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

class OperationResponse(BaseModel):
    id: str
    workOrderId: str
    index: int
    machineId: str
    name: str
    start: datetime
    end: datetime
    
    class Config:
        orm_mode = True

class WorkOrderResponse(BaseModel):
    id: str
    product: str
    qty: int
    operations: List[OperationResponse] = []
    
    class Config:
        orm_mode = True
    
def GetDB():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

dbDependency = Annotated[Session, Depends(GetDB)]

@app.put("/feed")
async def Feed(db: dbDependency):
    for workOrderId in ["WO-1001", "WO-1002"]:
        if db.query(models.WorkOrder).filter_by(id=workOrderId).first():
            raise HTTPException(status_code=400, detail=f"WorkOrder {workOrderId} already exists!")
    workOrder1 = models.WorkOrder(id="WO-1001", product="Widget A", qty=100)
    for operationId in ["OP-1", "OP-2", "OP-3", "OP4"]:
        if db.query(models.Operation).filter_by(id=operationId).first():
            raise HTTPException(status_code=400, detail=f"Operation {operationId} already exists!")
    workOrder1 = models.WorkOrder(id="WO-1001", product="Widget A", qty=100)
    workOrder2 = models.WorkOrder(id="WO-1002", product="Widget B", qty=50)
    db.add_all([workOrder1, workOrder2])
    db.commit()
    operation1 = models.Operation(id="OP-1", workOrderId="WO-1001", index=1, machineId="M1", name="Cut", start=datetime(2025, 8, 20, 9), end=datetime(2025, 8, 20, 10))
    operation2 = models.Operation(id="OP-2", workOrderId="WO-1001", index=2, machineId="M2", name="Assemble", start=datetime(2025, 8, 20, 10, 10), end=datetime(2025, 8, 20, 12))
    operation3 = models.Operation(id="OP-3", workOrderId="WO-1002", index=1, machineId="M1", name="Cut", start=datetime(2025, 8, 20, 9, 30), end=datetime(2025, 8, 20, 10, 30))
    operation4 = models.Operation(id="OP-4", workOrderId="WO-1002", index=2, machineId="M2", name="Assemble", start=datetime(2025, 8, 20, 10, 40), end=datetime(2025, 8, 20, 12, 15))
    db.add_all([operation1, operation2, operation3, operation4])
    db.commit()

@app.delete("/reset")
async def Reset(db: dbDependency):
    operations = db.query(models.Operation).all()
    for operation in operations:
        db.delete(operation)
        db.commit()
    workOrders = db.query(models.WorkOrder).all()
    for workOrder in workOrders:
        db.delete(workOrder)
        db.commit()
    
@app.get("/workorders", response_model=List[WorkOrderResponse])
async def WorkOrders(db: dbDependency):
    workOrders = db.query(models.WorkOrder).all()
    if not workOrders:
        raise HTTPException(status_code=404, detail="Work orders are not found!")
    return workOrders
