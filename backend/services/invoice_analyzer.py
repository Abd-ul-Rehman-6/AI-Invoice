def analyze(invoice_items, timesheet_items):
    discrepancies = []

    for i, inv in enumerate(invoice_items):
        match = next((t for t in timesheet_items if t["description"] == inv["description"]), None)

        if not match:
            discrepancies.append({
                "line": i+1,
                "issue": "Missing timesheet entry",
                "explanation": f"Line {i+1}: Item billed but not found in timesheet."
            })
            continue

        if inv["quantity"] > match["hours"]:
            diff = inv["quantity"] - match["hours"]
            discrepancies.append({
                "line": i+1,
                "issue": "Quantity mismatch",
                "explanation": f"Line {i+1}: {diff} extra hours billed than approved."
            })

        if inv["rate"] != match["approved_rate"]:
            discrepancies.append({
                "line": i+1,
                "issue": "Rate mismatch",
                "explanation": f"Line {i+1}: Rate mismatch between invoice and timesheet."
            })

    return discrepancies
