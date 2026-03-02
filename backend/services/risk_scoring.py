SEVERITY_WEIGHTS = {
    "low": 5,
    "medium": 15,
    "high": 30,
    "critical": 50
}

MAX_SCORE = 100


def _infer_severity(issue):
    """
    Determine severity based on issue type and financial impact
    """

    impact = abs(issue.get("impact", 0))
    issue_type = issue.get("type", "").upper()

    if issue_type in {
        "DUPLICATE_ENTRY", 
        "RATE_MISMATCH",
        "NOT_IN_TIMESHEET",
        "MISSING_BILLABLE_ITEM"
    } and impact >= 1000:
        return "critical"

    if impact >= 500:
        return "high"

    #Medium severity
    if impact >= 100:
        return "medium"

    if issue_type.startswith("SUSPICIOUS"):
        return "medium"
    return "low"


def calculate_risk_score(issues):
    """
    Calculate overall invoice risk score (0–100)

    issues: List[dict] output from detect_issues()
    """

    score = 0
    for issue in issues:
        severity = issue.get("severity")

        # Auto-assign severity if not present
        if not severity:
            severity = _infer_severity(issue)
            issue["severity"] = severity  
        score += SEVERITY_WEIGHTS.get(severity, 5)
    return min(score, MAX_SCORE)
