import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client, Client
from datetime import datetime
import dotenv

dotenv.load_dotenv()

# ------------------------------------------------------
# SUPABASE CONNECTION (Replace with your env variables)
# ------------------------------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Supabase environment variables are missing. Check SUPABASE_URL and SUPABASE_KEY.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

router = APIRouter()

# ------------------------------------------------------
# 📌 DATA MODELS FOR REQUESTS
# ------------------------------------------------------

class AcceptBidRequest(BaseModel):
    bid_id: int
    order_id: int
    deliver_id: str   # uuid


class DeliveryStatusUpdate(BaseModel):
    order_id: int
    status: str


# ------------------------------------------------------
# 📌 GET ALL BIDS (FOR DRIVER)
# Matches Supabase table: bids
# ------------------------------------------------------
@router.get("/driver/bids")
def get_all_bids():
    result = supabase.table("bids").select("*").execute()
    return {"bids": result.data}


# ------------------------------------------------------
# 📌 DRIVER ACCEPTS A BID
# 1. mark the selected bid as "accepted"
# 2. mark all other bids with same order as "rejected"
# 3. update order table: deliver_id = driver
# ------------------------------------------------------
@router.post("/driver/bids/accept")
def accept_bid(req: AcceptBidRequest):

    # 1. accept the chosen bid
    supabase.table("bids").update({
        "status": "accepted"
    }).eq("bid_id", req.bid_id).execute()

    # 2. reject all other bids for the same order
    supabase.table("bids").update({
        "status": "rejected"
    }).eq("order_id", req.order_id).neq("bid_id", req.bid_id).execute()

    # 3. update the order table
    supabase.table("order").update({
        "deliver_id": req.deliver_id,
        "status": "In Progress"
    }).eq("order_id", req.order_id).execute()

    return {"message": "Bid accepted and order assigned to driver."}


# ------------------------------------------------------
# 📌 GET ACTIVE DELIVERIES FOR DRIVER
# Uses order table
# ------------------------------------------------------
@router.get("/driver/transports/{driver_id}")
def get_driver_transports(driver_id: str):

    result = supabase.table("order").select("*") \
        .eq("deliver_id", driver_id) \
        .neq("status", "Delivered") \
        .execute()

    return {"deliveries": result.data}


# ------------------------------------------------------
# 📌 MARK A DELIVERY AS DELIVERED
# ------------------------------------------------------
@router.put("/driver/transports/delivered")
def mark_delivered(update: DeliveryStatusUpdate):

    supabase.table("order").update({
        "status": update.status
    }).eq("order_id", update.order_id).execute()

    return {"message": f"Order {update.order_id} updated to {update.status}"}


# ------------------------------------------------------
# 📌 GET RATINGS FOR DRIVER
# rating table matches: ratings.delivery_rating
# ------------------------------------------------------
@router.get("/driver/ratings/{driver_id}")
def get_driver_ratings(driver_id: str):

    # 1. get all orders this driver delivered
    orders = supabase.table("order").select("order_id") \
        .eq("deliver_id", driver_id).execute()

    order_ids = [o["order_id"] for o in orders.data]

    if not order_ids:
        return {"reviews": []}

    # 2. get all ratings for these orders
    ratings = supabase.table("ratings").select("*") \
        .in_("order_id", order_ids).execute()

    return {"reviews": ratings.data}
