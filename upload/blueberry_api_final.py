import json
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.edge.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests

EMAIL = "rafael@cogg.me"
PASSWORD = "123"

def main():
    print("🚀 BLUEBERRY MATH - EXTRAÇÃO 100% API")
    print("=" * 50)
    
    try:
        # Configurar Edge
        edge_options = Options()
        edge_options.add_argument("--headless")
        edge_options.add_argument("--no-sandbox")
        edge_options.add_argument("--disable-dev-shm-usage")
        edge_options.add_argument("--disable-gpu")
        edge_options.add_argument("--window-size=1920,1080")
        
        print("🔧 Inicializando navegador...")
        driver = webdriver.Edge(options=edge_options)
        
        # Fazer login
        print("🔐 Fazendo login...")
        driver.get("https://dashboard.school.blueberrymath.com/login")
        
        email_field = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.NAME, "email"))
        )
        password_field = driver.find_element(By.NAME, "password")
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        
        email_field.send_keys(EMAIL)
        password_field.send_keys(PASSWORD)
        login_button.click()
        
        # Aguardar login
        WebDriverWait(driver, 20).until(
            lambda d: "/turma" in d.current_url or "/dashboard" in d.current_url
        )
        print("✅ Login bem-sucedido!")
        
        # Capturar TODOS os cookies (incluindo HTTP-only)
        print("🍪 Capturando cookies HTTP-only...")
        all_cookies = driver.get_cookies()
        
        # Extrair token do localStorage
        print("🔑 Extraindo token...")
        token = driver.execute_script("return localStorage.getItem('bb_user_token');")
        
        if not token:
            # Tentar sessionStorage
            token = driver.execute_script("return sessionStorage.getItem('bb_user_token');")
        
        if not token:
            print("❌ Token não encontrado no localStorage/sessionStorage")
            return
        
        print("✅ Token e cookies capturados!")
        
        # Construir headers para requisição direta
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            'Accept': 'application/json, text/plain, */*',
            'Authorization': f'Bearer {token}',
            'Referer': 'https://dashboard.school.blueberrymath.com/'
        }
        
        # Construir cookies para requests
        cookies_dict = {}
        for cookie in all_cookies:
            cookies_dict[cookie['name']] = cookie['value']
        
        # Fazer requisição direta à API
        print("📡 Acessando API diretamente...")
        response = requests.get(
            'https://dashboard.school.blueberrymath.com/api/front/courses?hasBlueBerry=1&lang=pt',
            headers=headers,
            cookies=cookies_dict
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("✅ DADOS OBTIDOS VIA API 100%!")
                
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"blueberry_api_100_{timestamp}.json"
                with open(filename, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                
                print(f"📁 Arquivo salvo: {filename}")
                
                # Mostrar turmas
                courses = []
                if isinstance(data.get('data'), list):
                    courses = data['data']
                elif isinstance(data, list):
                    courses = data
                
                if courses:
                    print(f"\n📊 Turmas encontradas ({len(courses)}):")
                    for i, course in enumerate(courses):
                        name = course.get('name', 'Sem nome')
                        guid = course.get('guid', 'sem-guid')
                        print(f"{i+1}. {name} | GUID: {guid}")
                
                return
                
            except json.JSONDecodeError:
                print("❌ Resposta não é JSON válido")
                print(f"Conteúdo: {response.text[:200]}...")
        else:
            print(f"❌ Erro na requisição: {response.status_code}")
            print(f"Resposta: {response.text[:200]}...")
            
    except Exception as e:
        print(f"🔥 ERRO: {str(e)}")
    
    finally:
        try:
            driver.quit()
            print("CloseOperation: Navegador fechado.")
        except:
            pass

if __name__ == "__main__":
    main()