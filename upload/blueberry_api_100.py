import requests
import json
from datetime import datetime

# Headers reais da sua sessão (sem cache)
HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJndWlkIjoiMDU3YjVkNTAtZWEzMi0xMWVmLTk2NjQtMzE1YzViMTRiZTFiIiwidXNlcm5hbWUiOiJyYWZhZWxAY29nZy5tZSIsImVtYWlsIjoicmFmYWVsQGNvZ2cubWUiLCJyb2xlX2d1aWQiOiJSMDIiLCJuYW1lIjoiUmFmYWVsIiwibGFzdG5hbWUiOiJDb2dnIiwiYXZhdGFyIjoiIiwibGFuZ19pZCI6bnVsbCwibG9naW5fdmVyc2lvbiI6MSwiZXhwIjoxODAwNzUxMDY5LCJ0ZW5hbnQiOiIzYzBhZGJhMS1kMGRmLTRiMzktOGFiYS03YTY3OThmOGZlZjMiLCJsdGkiOmZhbHNlfQ.aFVoFHj9w-2WAAFrnu4nyOKtHIcSUVL1mqtSsq5YGjc',
    'baggage': 'sentry-environment=production,sentry-release=daae3852277a0480341c12612eebaee3b48dab78,sentry-public_key=a33d133cc7e68374aec1324308dd8aaa,sentry-trace_id=76c571bd258742e78e2c5e0af7f22649,sentry-sample_rate=1,sentry-sampled=true',
    'cookie': 'analytics_session_id=1769214076131; g_state={"i_l":0,"i_ll":1769215067128,"i_b":"3/yzMgUW4JVE3eLXl8JsU0qy2/myB+UdBAV58E9SVeA","i_e":{"enable_itp_optimization":0}}; ajs_user_id=057b5d50-ea32-11ef-9664-315c5b14be1b; ajs_anonymous_id=b68c3c59-c146-4cac-a49f-b1f86b532eb5; analytics_session_id.last_access=1769217647504; ph_phc_r9ol95litloztOyH3iV6uqMS8KCnXzzxfgtm7jFpyMu_posthog=%7B%22distinct_id%22%3A%22057b5d50-ea32-11ef-9664-315c5b14be1b%22%2C%22%24sesid%22%3A%5B1769217861158%2C%22019bed6f-838e-7263-9d5e-5e67ab632957%22%2C1769215067022%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fdashboard.school.blueberrymath.com%2Flogin%22%7D%7D',
    'priority': 'u=1, i',
    'referer': 'https://dashboard.school.blueberrymath.com/087c7fb0-ee61-11ef-a926-b948d65ac3f9/reports',
    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Microsoft Edge";v="144"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sentry-trace': '76c571bd258742e78e2c5e0af7f22649-bc42b4be6dd71fa7-1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0'
}

def main():
    print("🚀 BLUEBERRY MATH - EXTRAÇÃO 100% API")
    print("=" * 50)
    
    try:
        # Requisição direta à API (sem header de cache)
        response = requests.get(
            'https://dashboard.school.blueberrymath.com/api/front/courses?hasBlueBerry=1&lang=pt',
            headers=HEADERS
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCESSO! Dados obtidos via API 100%!")
            
            # Salvar dados
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
                    students_count = len(course.get('students', [])) if course.get('students') else course.get('student_count', 0)
                    print(f"{i+1}. {name} | GUID: {guid} | Alunos: {students_count}")
            
            return
        
        else:
            print(f"❌ Erro na requisição: {response.status_code}")
            print(f"Resposta: {response.text[:200]}...")
            
    except Exception as e:
        print(f"🔥 ERRO: {str(e)}")

if __name__ == "__main__":
    main()