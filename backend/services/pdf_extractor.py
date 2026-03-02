import pdfplumber


def extract_invoice_data(file_path):
    data = {}

    try:
        with pdfplumber.open(file_path) as pdf:
            if not pdf.pages:
                return {}

            text = pdf.pages[0].extract_text()
            if not text:
                return {}

            data["raw_text"] = text
            return data

    except Exception as e:
        print("PDF extract error:", e)
        return {}
