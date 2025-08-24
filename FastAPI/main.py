from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Annotated
import models
from database import engine, SessionLocal
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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

class UpdateOperationRequest(BaseModel):
    id: str
    start: datetime
    end: datetime
    
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
    operation1 = models.Operation(id="OP-1", workOrderId="WO-1001", index=1, machineId="M1", name="Cut", start=datetime(2025, 8, 24, 9, tzinfo=timezone.utc), end=datetime(2025, 8, 24, 10, tzinfo=timezone.utc))
    operation2 = models.Operation(id="OP-2", workOrderId="WO-1001", index=2, machineId="M2", name="Assemble", start=datetime(2025, 8, 24, 10, 10, tzinfo=timezone.utc), end=datetime(2025, 8, 24, 12, tzinfo=timezone.utc))
    operation3 = models.Operation(id="OP-3", workOrderId="WO-1002", index=1, machineId="M1", name="Cut", start=datetime(2025, 8, 24, 9, 30, tzinfo=timezone.utc), end=datetime(2025, 8, 24, 10, 30, tzinfo=timezone.utc))
    operation4 = models.Operation(id="OP-4", workOrderId="WO-1002", index=2, machineId="M2", name="Assemble", start=datetime(2025, 8, 24, 10, 40, tzinfo=timezone.utc), end=datetime(2025, 8, 24, 12, 15, tzinfo=timezone.utc))
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
async def GetWorkOrders(db: dbDependency):
    workOrders = db.query(models.WorkOrder).all()
    if not workOrders:
        raise HTTPException(status_code=404, detail="Work orders are not found!")
    return workOrders

@app.get("/operations", response_model=List[OperationResponse])
async def GetOperations(db: dbDependency):
    operations = db.query(models.Operation).all()
    if not operations:
        raise HTTPException(status_code=404, detail="Operations are not found!")
    return operations

@app.patch("/operations")
async def UpdateOperation(updateOperationRequest: UpdateOperationRequest, db: dbDependency):
    if updateOperationRequest.start.tzinfo is None:
        updateOperationRequest.start = updateOperationRequest.start.replace(tzinfo=timezone.utc)
    else:
        updateOperationRequest.start = updateOperationRequest.start.astimezone(timezone.utc)
    if updateOperationRequest.end.tzinfo is None:
        updateOperationRequest.end = updateOperationRequest.end.replace(tzinfo=timezone.utc)
    else:
        updateOperationRequest.end = updateOperationRequest.end.astimezone(timezone.utc)
        
    if (updateOperationRequest.start > updateOperationRequest.end):
        raise HTTPException(status_code=400, detail="End date must be greater then start date!")
    
    if (updateOperationRequest.start < datetime.now(timezone.utc)):
        raise HTTPException(status_code=400, detail="R3 - No past: an operation’s start cannot be before “now”.")
        
    operation = db.query(models.Operation).filter_by(id=updateOperationRequest.id).first()
    if not operation:
        raise HTTPException(status_code=404, detail=f"Operation {updateOperationRequest.id} not found!")
    
    if operation.index > 1:
        pastOperationInWorkOrder = db.query(models.Operation).filter_by(workOrderId=operation.workOrderId, index=operation.index-1).first()
        if not pastOperationInWorkOrder:
            raise HTTPException(status_code=404, detail=f"The previous operation in the same work order as operation {operation.id} could not be found!")
        if updateOperationRequest.start < pastOperationInWorkOrder.end:
            raise HTTPException(status_code=400, detail="R1 - Precedence (within WO): operation k must start at or after operation k-1 ends.")
    
    
    nextOperationInWorkOrder = db.query(models.Operation).filter_by(workOrderId=operation.workOrderId, index=operation.index+1).first()
    if nextOperationInWorkOrder and nextOperationInWorkOrder.start < updateOperationRequest.end:
        raise HTTPException(status_code=400, detail="R1 - Precedence (within WO): operation k must start at or after operation k-1 ends.")
        
    if db.query(models.Operation).filter(and_(models.Operation.machineId == operation.machineId, or_(and_(updateOperationRequest.start > models.Operation.start, updateOperationRequest.start < models.Operation.end), and_(updateOperationRequest.end > models.Operation.start, updateOperationRequest.end < models.Operation.end)))).first():
        raise HTTPException(status_code=400, detail="R2 - Lane exclusivity: no overlaps with other operations on the same machineId.")
    
    operation.start = updateOperationRequest.start
    operation.end = updateOperationRequest.end
    db.commit()
    db.refresh(operation)
    return { "message": f"Operation {updateOperationRequest.id} updated successfully!", "id": operation.id, "start": operation.start, "end": operation.end }
