from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, Spacer, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

def generate_invoice_pdf(data_dict, counts, buffer):
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    styles = getSampleStyleSheet()
    
    
    body_style = styles["Normal"]
    body_style.fontSize = 9
    body_style.wordWrap = 'CJK' 

    elements = []

    elements.append(Paragraph("<b>AUDIT VERIFICATION REPORT</b>", styles["Title"]))
    elements.append(Spacer(1, 15))
    elements.append(Paragraph(f"<b>Client:</b> {data_dict.get('client_name')}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Date:</b> {data_dict.get('invoice_date')}", styles["Normal"]))
    elements.append(Spacer(1, 15))

    headers = [Paragraph("<b>Vendor Name</b>", body_style), 
               Paragraph("<b>Invoice #</b>", body_style), 
               Paragraph("<b>Amount</b>", body_style), 
               Paragraph("<b>Risk</b>", body_style), 
               Paragraph("<b>Status</b>", body_style)]
    
    formatted_rows = [headers]
    for row in data_dict.get('table_rows', []):
        formatted_rows.append([Paragraph(str(cell), body_style) for cell in row])

    col_widths = [140, 90, 90, 70, 90]
    main_table = Table(formatted_rows, colWidths=col_widths, repeatRows=1)
    main_table.setStyle(TableStyle([
        # Header Style 
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EBF1F7")), 
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#2C3E50")), 
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D8E0")), 
        
        # Row Padding 
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        
        # Alternate Row Shading 
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))

    elements.append(main_table)
    elements.append(Spacer(1, 25))

    # Detailed Findings Section
    findings = data_dict.get('detailed_findings', [])
    if findings:
        elements.append(Paragraph("<b>Detailed Audit Findings</b>", styles["Heading3"]))

        # helper to strip/normalize HTML tags that ReportLab's parser doesn't like
        import re
        def _sanitize(item_html: str) -> str:
            # remove enclosing <div> blocks entirely, leave inner text
            item_html = re.sub(r"<\/?div[^>]*>", "", item_html, flags=re.IGNORECASE)
            # convert bare <br> tags to self-closing so parser won't treat following text as
            # content inside the tag (which triggers "No content allowed in br tag").
            item_html = re.sub(r"<br\s*>", "<br/>", item_html, flags=re.IGNORECASE)
            return item_html

        for item in findings:
            safe_html = _sanitize(item)
            elements.append(Paragraph(safe_html, styles["Normal"]))
            elements.append(Spacer(1, 5))

    doc.build(elements)