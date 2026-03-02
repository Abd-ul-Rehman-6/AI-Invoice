import pandas as pd

def parse_excel_invoice(path):
    df = pd.read_excel(path)

    line_items = []
    for _, row in df.iterrows():
        line_items.append({
            "description": row["Description"],
            "quantity": float(row["Hours"]),
            "rate": float(row["Rate"]),
            "total": float(row["Amount"])
        })

    return line_items
