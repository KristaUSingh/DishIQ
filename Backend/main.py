from fastapi import FastAPI
from routers import delivery_routes, chatbot_routes, image_routes

app = FastAPI(title="DishIQ Backend", version="1.0")

# Register routers
app.include_router(delivery_routes.router, prefix="/delivery", tags=["Delivery"])
app.include_router(chatbot_routes.router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(image_routes.router, prefix="/image-search", tags=["Image Search"])

@app.get("/")
def root():
    return {"message": "Welcome to DishIQ Backend!"}
