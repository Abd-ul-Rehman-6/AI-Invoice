import pdfplumber
import re

def parse_pdf_invoice(path):
    """
    Robust PDF parser for InvoiceIQ.
    Returns:
        {
            "invoice_number": str,
            "client_name": str,
            "line_items": [
                {
                    "description": str,
                    "date": str,
                    "quantity": float,
                    "rate": float,
                    "total": float
                }, ...
            ],
            "total": float
        }
    """

    data = {
        "invoice_number": None,
        "client_name": None,
        "invoice_date": None,
        "line_items": [],
        "total": None
    }

    full_text = ""

    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            full_text += text + "\n"

            #TABLE EXTRACTION
            tables = page.extract_tables() or []
            for table in tables:
                if not table or len(table) < 2:
                    continue

                headers = [h.lower() if h else f"col{i}" for i, h in enumerate(table[0])]
                for row in table[1:]:
                    if not row or len(row) < 2:
                        continue

                    try:
                        row_dict = dict(zip(headers, row))

                        description = row_dict.get("description") or row_dict.get("item") or ""
                        date = row_dict.get("date") or ""
                        quantity = float(re.sub(r"[^\d.]", "", row_dict.get("quantity") or "0"))
                        rate = float(re.sub(r"[^\d.]", "", row_dict.get("rate") or "0"))
                        total = float(re.sub(r"[^\d.]", "", row_dict.get("total") or "0"))

                        # Append as dict
                        data["line_items"].append({
                            "description": description.strip(),
                            "date": date.strip(),
                            "quantity": quantity,
                            "rate": rate,
                            "total": total
                        })
                    except Exception:
                        continue

    #METADATA EXTRACTION
    inv_match = re.search(r"Invoice Number[:\-]?\s*(\S+)", full_text, re.IGNORECASE)
    if inv_match:
        data["invoice_number"] = inv_match.group(1)

    client_match = re.search(
        r"(Client Name|Bill To|Client|Billed To)[:\-]?\s*(.+)",
        full_text,
        re.IGNORECASE
    )
    if client_match:
         client_name = client_match.group(2).strip().split("\n")[0]
         data["client_name"] = client_name
    else:
        data["client_name"] = "N/A"

    date_patterns = [
        r"(Invoice Date|Date)[:\-]?\s*([0-9]{2}[\/\-][0-9]{2}[\/\-][0-9]{4})",
        r"(Invoice Date|Date)[:\-]?\s*([0-9]{4}[\/\-][0-9]{2}[\/\-][0-9]{2})",
        r"(Invoice Date|Date)[:\-]?\s*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})",
        r"(Invoice Date|Date)[:\-]?\s*([A-Za-z]+\s+[0-9]{1,2},?\s+[0-9]{4})"
    ]

    invoice_date = None
    for pattern in date_patterns:
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            invoice_date = match.group(2)
            break

    data["invoice_date"] = invoice_date

    total_match = re.search(r"(Total Amount|Total Amount Due)[:\-]?\s*\$?\s*([\d,.]+)", full_text, re.IGNORECASE)
    if total_match:
        data["total"] = float(total_match.group(2).replace(",", ""))

    #SAFE TEXT FALLBACK
    if not data["line_items"]:
        for line in full_text.splitlines():
            match = re.match(
                r"^\d+\s+(.+?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$",
                line
            )
            if match:
                try:
                    data["line_items"].append({
                        "description": match.group(1).strip(),
                        "date": "",  # fallback
                        "quantity": float(match.group(2)),
                        "rate": float(match.group(3)),
                        "total": float(match.group(4))
                    })
                except ValueError:
                    continue

    #ENSURE ALL ITEMS ARE DICTS 
    data["line_items"] = [i for i in data["line_items"] if isinstance(i, dict)]

    return data
