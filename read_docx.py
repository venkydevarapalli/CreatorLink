import zipfile
import xml.etree.ElementTree as ET
import sys

def get_docx_text(path):
    document = zipfile.ZipFile(path)
    xml_content = document.read('word/document.xml')
    document.close()
    
    tree = ET.fromstring(xml_content)
    
    # Namespaces for Word XML
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    paragraphs = []
    for p in tree.findall('.//w:p', ns):
        texts = [node.text for node in p.findall('.//w:t', ns) if node.text]
        if texts:
            paragraphs.append(''.join(texts))
            
    return '\n'.join(paragraphs)

if __name__ == '__main__':
    text = get_docx_text('major.docx')
    with open('major_text.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Done")
