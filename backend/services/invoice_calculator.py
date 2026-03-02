def calculate_invoice(items):
      """
    Ensures:
    - line_total = quantity * rate
    - subtotal = sum(line_totals)
    """
      normalized_items = []
      subtotal = 0.0

      for item in items:
            qty = float(item.get("quantity", 0))
            rate = float(item.get("rate", 0))

            line_total = round(qty * rate, 2)
            subtotal += line_total

            normalized_items.append({
                  "description" : item.get("description", "N/A"),
                  "quantity" : qty,
                  "rate" : rate,
                  "line_total" : line_total
            })
            return normalized_items, round(subtotal, 2)
      

    
          