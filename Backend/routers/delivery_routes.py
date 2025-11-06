from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import uuid
from datetime import datetime

router = APIRouter()

# --- Data Models ---
class Bid(BaseModel):
    bid_id: str
    order_id: str
    delivery_id: str
    bid_price: float
    status: str = "pending"

class DeliveryStatus(BaseModel):
    delivery_id: str
    order_id: str
    status: str
    timestamp: datetime

# --- In-memory placeholders (replace with Supabase/DB later) ---
bids_db: List[Bid] = []
deliveries_db: List[DeliveryStatus] = []

# --- Endpoints ---
@router.post("/bid")
def submit_bid(bid: Bid):
    bid.bid_id = str(uuid.uuid4())
    bids_db.append(bid)
    return {"message": "Bid submitted successfully", "bid": bid}

@router.get("/bids/{order_id}")
def get_bids(order_id: str):
    order_bids = [b for b in bids_db if b.order_id == order_id]
    return {"bids": order_bids}

@router.put("/assign/{order_id}/{delivery_id}")
def assign_delivery(order_id: str, delivery_id: str):
    for bid in bids_db:
        if bid.order_id == order_id:
            bid.status = "rejected"
    for bid in bids_db:
        if bid.order_id == order_id and bid.delivery_id == delivery_id:
            bid.status = "accepted"
    deliveries_db.append(DeliveryStatus(
        delivery_id=delivery_id, order_id=order_id,
        status="In Progress", timestamp=datetime.now()
    ))
    return {"message": f"Delivery assigned to {delivery_id}"}

@router.put("/update-status/{order_id}")
def update_delivery(order_id: str, status: str):
    for d in deliveries_db:
        if d.order_id == order_id:
            d.status = status
            d.timestamp = datetime.now()
            return {"message": f"Order {order_id} status updated to {status}"}
    raise HTTPException(status_code=404, detail="Delivery not found")
