from collections import defaultdict

def detect_issues(invoice_items, timesheet_items):
    """
    Compare invoice vs timesheet / PO and detect anomalies.

    Expected item format:
    {
        "description": str,
        "date": str,
        "quantity": float,
        "rate": float,
        "total": float
    }
    """

    issues = []

    # ---------- Build lookup maps ----------
    timesheet_map = {}
    for ts in timesheet_items:
        key = (ts["description"].lower(), ts.get("date", ""))
        timesheet_map[key] = ts

    invoice_seen = set()

    # ---------- Invoice → Timesheet comparison ----------
    for line_no, inv in enumerate(invoice_items, start=1):
        description = inv.get("description", "N/A")
        date = inv.get("date", "")
        key = (description.lower(), date)

        # Duplicate entry
        if key in invoice_seen:
            issues.append({
                "type": "DUPLICATE_ENTRY",
                "line": line_no,
                "explanation": f"Line {line_no}: Duplicate invoice entry for '{description}'.",
                "impact": inv.get("total", 0),
                "severity": "medium"
            })
        invoice_seen.add(key)

        # Missing in timesheet
        if key not in timesheet_map:
            issues.append({
                "type": "NOT_IN_TIMESHEET",
                "line": line_no,
                "explanation": f"Line {line_no}: '{description}' billed but not in timesheet.",
                "impact": inv.get("total", 0),
                "severity": "high"
            })
            continue

        ts = timesheet_map[key]

        # Quantity mismatch
        if inv.get("quantity") != ts.get("quantity"):
            diff = ts.get("quantity", 0) - inv.get("quantity", 0)
            issues.append({
                "type": "QUANTITY_MISMATCH",
                "line": line_no,
                "explanation": f"Line {line_no}: Quantity mismatch. Missing {abs(diff)} hours billed.",
                "impact": abs(diff * inv.get("rate", 0)),
                "severity": "medium"
            })

        # Rate mismatch
        if inv.get("rate") != ts.get("rate"):
            issues.append({
                "type": "RATE_MISMATCH",
                "line": line_no,
                "explanation": f"Line {line_no}: Rate mismatch. Timesheet {ts.get('rate')} vs Invoice {inv.get('rate')}.",
                "impact": abs((inv.get("rate", 0) - ts.get("rate", 0)) * inv.get("quantity", 0)),
                "severity": "medium"
            })

    # ---------- Timesheet → Invoice (missing billables) ----------
    invoice_keys = {(i.get("description","").lower(), i.get("date","")) for i in invoice_items}
    for ts in timesheet_items:
        key = (ts.get("description","").lower(), ts.get("date",""))
        if key not in invoice_keys:
            issues.append({
                "type": "MISSING_BILLABLE_ITEM",
                "line": None,
                "explanation": f"'{ts.get('description','')}' missing in invoice. Potential revenue leakage.",
                "impact": ts.get("quantity",0) * ts.get("rate",0),
                "severity": "high"
            })

    # ---------- Fraud / suspicious patterns ----------
    for line_no, inv in enumerate(invoice_items, start=1):
        if inv.get("quantity",0) > 16:
            issues.append({
                "type": "SUSPICIOUS_HOURS",
                "line": line_no,
                "explanation": f"Line {line_no}: Unusually high hours ({inv.get('quantity')}) billed in a day.",
                "impact": 0,
                "severity": "medium"
            })
        if inv.get("total",0) % 1000 == 0:
            issues.append({
                "type": "SUSPICIOUS_AMOUNT",
                "line": line_no,
                "explanation": f"Line {line_no}: Suspicious round total ({inv.get('total')}).",
                "impact": 0,
                "severity": "low"
            })

    return issues
