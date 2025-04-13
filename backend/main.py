from typing import Union

from fastapi import FastAPI, Request

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

# Receive a coordinate and call an external API to get its features
@app.post("/get-features")
async def get_features(request: Request):
    data = await request.json()
    lng, lat = data.get("lngLat")
    return {"lng": lng or None, "lat": lat or None}