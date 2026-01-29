from mitmproxy import http
import json
import os

# Arquivo onde salvaremos os headers
HEADERS_FILE = "captured_headers.json"

def response(flow: http.HTTPFlow) -> None:
    # Verificar se é a requisição que queremos
    if "/api/front/courses" in flow.request.url:
        print(f"✅ Capturada requisição: {flow.request.url}")
        
        # Extrair headers da requisição (não da resposta!)
        headers_dict = {}
        for name, value in flow.request.headers.items():
            headers_dict[name] = value
        
        # Salvar em arquivo
        with open(HEADERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(headers_dict, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Headers salvos em: {HEADERS_FILE}")