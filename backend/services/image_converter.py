from pdf2image import convert_from_bytes
from io import BytesIO


def pdf_to_image_bytes(pdf_bytes, image_format="png"):
    images = convert_from_bytes(
        pdf_bytes,
        poppler_path=r"C:\poppler\Library\bin"
    )

    buffer = BytesIO()
    images[0].save(buffer, format=image_format.upper())
    buffer.seek(0)
    return buffer
