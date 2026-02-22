from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import re

# Read markdown file
with open('algorithm-doc.md', 'r') as f:
    content = f.read()

# Create PDF
pdf_file = "algorithm-doc.pdf"
doc = SimpleDocTemplate(pdf_file, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)

# Container for PDF elements
elements = []

# Define styles
styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=18,
    textColor=colors.HexColor('#1a1a1a'),
    spaceAfter=12,
    alignment=TA_CENTER,
    fontName='Helvetica-Bold'
)

heading1_style = ParagraphStyle(
    'CustomHeading1',
    parent=styles['Heading1'],
    fontSize=14,
    textColor=colors.HexColor('#0066cc'),
    spaceAfter=8,
    fontName='Helvetica-Bold'
)

heading2_style = ParagraphStyle(
    'CustomHeading2',
    parent=styles['Heading2'],
    fontSize=11,
    textColor=colors.HexColor('#333333'),
    spaceAfter=6,
    fontName='Helvetica-Bold'
)

body_style = ParagraphStyle(
    'CustomBody',
    parent=styles['BodyText'],
    fontSize=10,
    alignment=TA_LEFT,
    spaceAfter=8
)

# Simple markdown to PDF conversion
lines = content.split('\n')
i = 0
while i < len(lines):
    line = lines[i].strip()
    
    if line.startswith('# ') and not line.startswith('##'):
        elements.append(Paragraph(line[2:], title_style))
        elements.append(Spacer(1, 0.2*inch))
    elif line.startswith('## '):
        elements.append(Paragraph(line[3:], heading1_style))
        elements.append(Spacer(1, 0.1*inch))
    elif line.startswith('### '):
        elements.append(Paragraph(line[4:], heading2_style))
        elements.append(Spacer(1, 0.08*inch))
    elif line.startswith('```'):
        # Find code block end
        code_lines = []
        i += 1
        while i < len(lines) and not lines[i].strip().startswith('```'):
            code_lines.append(lines[i])
            i += 1
        code_text = '\n'.join(code_lines)
        code_style = ParagraphStyle('Code', parent=styles['Normal'], fontSize=8, fontName='Courier', textColor=colors.HexColor('#333333'))
        elements.append(Paragraph('<font face="Courier" size="8"><pre>' + code_text.replace('<', '&lt;').replace('>', '&gt;') + '</pre></font>', code_style))
        elements.append(Spacer(1, 0.08*inch))
    elif line.startswith('|'):
        # Skip table rendering - too complex, just add as text
        elements.append(Paragraph(line.replace('|', ' | '), body_style))
    elif line and not line.startswith('-') and not line.startswith('*'):
        elements.append(Paragraph(line, body_style))
    elif line.startswith('-'):
        elements.append(Paragraph('• ' + line[1:].strip(), body_style))
    
    # Add page break for new major sections
    if line.startswith('## ') and i > 100:
        elements.append(PageBreak())
    
    i += 1

# Build PDF
try:
    doc.build(elements)
    print(f"✓ PDF created successfully: {pdf_file}")
except Exception as e:
    print(f"✗ Error creating PDF: {e}")
