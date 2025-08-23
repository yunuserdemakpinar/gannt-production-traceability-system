from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base

class WorkOrder(Base):
    __tablename__ = "WorkOrders"
    
    id = Column(String, primary_key=True, index=True)
    product = Column(String)
    qty = Column(Integer)
    
    operations = relationship("Operation", back_populates="workorder")
    
class Operation(Base):
    __tablename__ = "Operations"
    
    id = Column(String, primary_key=True, index=True)
    workOrderId = Column(String, ForeignKey("WorkOrders.id"))
    index = Column(Integer)
    machineId = Column(String)
    name = Column(String)
    start = Column(DateTime)
    end = Column(DateTime)
    
    workorder = relationship("WorkOrder", back_populates="operations")
