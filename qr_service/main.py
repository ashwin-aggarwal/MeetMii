from io import BytesIO
import qrcode
from fastapi import FastAPI
from fastapi.responses import Response

app = FastAPI()


@app.get("/")
def root():
    return {"message": "MeetMii QR service is running"}


@app.get("/qr/{username}")
def generate_qr(username: str):
    """Generate a QR code PNG for the given username.

    Encodes the public profile URL https://meetmii.com/{username} into a
    QR code and returns it as a PNG image. The image is generated in memory
    and never written to disk.
    """
    url = f"https://meetmii.com/{username}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    image_bytes = buffer.read()

    return Response(content=image_bytes, media_type="image/png")
