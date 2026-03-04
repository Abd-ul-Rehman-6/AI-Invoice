import os
import json
import io
import re
from PIL import Image
from pdf2image import convert_from_path
from ollama import Client

# Client Setup
OLLAMA_TOKEN = os.getenv("OLLAMA_API_KEY") 
client = Client(
    host="https://ollama.com",
    headers={'Authorization': f'Bearer {OLLAMA_TOKEN}'}
)

def analyze_invoice_with_ai(invoice_path):
    try:
        if invoice_path.lower().endswith('.pdf'):
            pages = convert_from_path(invoice_path)
        else:
            pages = [Image.open(invoice_path)]

        all_page_bytes = []
        for img in pages:
            img.thumbnail((2000, 2000), Image.Resampling.LANCZOS) 
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=95)
            all_page_bytes.append(img_byte_arr.getvalue())

    except Exception as e:
        return {"error": f"File Processing Error: {str(e)}"}

    
    prompt = """
    Act as a Forensic Auditor. Analyze the provided image and perform a manual math audit. 
    
    IMPORTANT: 
    - Do NOT use the numbers from the example below. 
    - Extract REAL data from the image: Vendor Name, Invoice Number, and every Table Row.
    - Calculate (Quantity * Unit Price) for every item yourself.
    - Compare your calculated sum + tax with the printed 'Final Balance'.
    CRITICAL INSTRUCTION:
    If you detect ANY visual inconsistency (Font mismatch, alignment shift, manual annotations, or pixel artifacts), you MUST label the invoice as 'FAKE'.
    
    CHECKLIST:
    1. FONT: Is the font style, size, or boldness inconsistent in the 'Total' or 'Price' fields?
    2. ALIGNMENT: Are digits floating or shifted from the base grid?
    3. TAMPERING: Are there manual notes, white-outs, or 'typed over' signs?

    If you find any of the above, you MUST explain it in the 'tampering_reason' field.

    Return a single JSON object with the following structure. Use <br> for line breaks inside the string.

    {
      "invoices": [
        {
          "vendor_name": "Extract from image",
          "invoice_number": "Extract from image",
          "total_amount": "Printed total from image", 
          "risk_level": "High (if math is wrong) or Low (if math is correct)",
          "tampering_detected": "Yes/No",
          "tampering_reason": "Provide ONLY the visual flaw found. If none, say 'Document layout is consistent'.",
          "status_tag": "Verified (if No) / Tampering Detected (if Yes)",
          "detailed_review": "
            <b>Price Breakdown:</b><br>
            [List each item found in image: Qty x Rate = Calculated Amount]<br>
            - Tax: [Amount]<br>
            --------------------------<br>
            <b>Actual Total:</b> $[Your calculated sum]<br>
            <b>Invoice Total:</b> $[Printed total from image]<br><br>
            
          "
        }
      ]
    }
    """
    try:
        response = client.chat(
            model='gemma3:27b',
            messages=[{'role': 'user', 'content': prompt, 'images': all_page_bytes}],
            format='json', 
            stream=False,
            options={
                'temperature': 0, 
                'num_ctx': 8192
            } 
        )
        
        raw_content = response.message.content
        try:
            data = json.loads(raw_content)
        except json.JSONDecodeError:
            json_match = re.search(r'\{.*\}', raw_content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(0))
            else:
                raise ValueError("Invalid AI Response")
        print(data)
        return data
        
    except Exception as e:
        return {"error": f"Audit Error: {str(e)}"}