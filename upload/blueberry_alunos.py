import requests
import json
from datetime import datetime

# Seus headers reais (mesmos do script anterior)
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

# Lista de turmas com GUIDs (do seu arquivo JSON)
TURMAS = [
    {"nome": "3° Matutino - Jéssica", "guid": "087c7fb0-ee61-11ef-a926-b948d65ac3f9"},
    {"nome": "4° Matutino - Patricia", "guid": "08fcc940-2485-11f0-86cc-3fdcf0b597ca"},
    {"nome": "2°", "guid": "113e9f10-faa1-11ef-bcae-ffab780a0661"},
    {"nome": "4° Vespertino - Patricia", "guid": "208a9a10-2485-11f0-a121-07d276d7a4d2"},
    {"nome": "5° - Emanuella", "guid": "413e39a0-2486-11f0-a121-07d276d7a4d2"},
    {"nome": "2° Vespertino - Janayna", "guid": "591af1f0-247f-11f0-a121-07d276d7a4d2"},
    {"nome": "3° Vespertino - Jéssica", "guid": "c55ff000-2483-11f0-86cc-3fdcf0b597ca"},
    {"nome": "1º Vespertino - Emanuella", "guid": "cdf39ae0-ee60-11ef-bdbc-4fd7510398e9"},
    {"nome": "5°", "guid": "daa47e20-92f9-11ef-8383-936a68d617e3"}
]

def extrair_dados_alunos(guid_turma):
    """Extrai dados dos alunos de uma turma específica"""
    # 🔧 URL CORRIGIDA: sem espaços antes do {guid_turma}
    url = f"https://dashboard.school.blueberrymath.com/api/blueberry/teacher/{guid_turma}/students?days=30&lang=pt"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"   ❌ Erro: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"   🔥 Erro: {str(e)}")
        return None

def processar_dados_alunos(dados_brutos):
    """Processa os dados brutos no formato do analyzer v1.0"""
    if not dados_brutos:
        return []
    
    alunos_processados = []
    
    # Estrutura esperada: dados_brutos['data']['users'] ou similar
    users = []
    if dados_brutos.get('data', {}).get('users'):
        users = dados_brutos['data']['users']
    elif dados_brutos.get('users'):
        users = dados_brutos['users']
    elif isinstance(dados_brutos.get('data'), list):
        users = dados_brutos['data']
    else:
        # Tentar encontrar recursivamente
        def find_users(obj):
            if isinstance(obj, dict):
                if 'users' in obj and isinstance(obj['users'], list):
                    return obj['users']
                for value in obj.values():
                    result = find_users(value)
                    if result:
                        return result
            elif isinstance(obj, list):
                for item in obj:
                    result = find_users(item)
                    if result:
                        return result
            return []
        
        users = find_users(dados_brutos)
    
    for aluno in users:
        time_min = aluno.get('totalTimeInSeconds', 0) / 60
        
        # Extrair dificuldades
        difficulties = []
        for item in aluno.get('needHelpLoPhase', []):
            if item.get('description'):
                difficulties.append(item['description'])
            elif item.get('reason'):
                difficulties.append(item['reason'])
        
        # Classificação individual (Semáforo)
        if time_min < 30:
            status = "VERMELHO"
        elif time_min < 60:
            status = "AMARELO"
        else:
            status = "VERDE"
        
        alunos_processados.append({
            "student_id": aluno.get('guid', 'sem-id'),
            "student_name": f"{aluno.get('name', '')} {aluno.get('lastname', '')}".strip() or 'Aluno sem nome',
            "time_spent_minutes": round(time_min, 2),
            "correct_count": aluno.get('activities', {}).get('ok', 0),
            "incorrect_count": aluno.get('activities', {}).get('ko', 0),
            "abandoned_count": aluno.get('activities', {}).get('unfinished', 0),
            "total_activities": aluno.get('activities', {}).get('total', 0) or (
                aluno.get('activities', {}).get('ok', 0) + 
                aluno.get('activities', {}).get('ko', 0) + 
                aluno.get('activities', {}).get('unfinished', 0)
            ),
            "difficulties": difficulties,
            "mastered_kcs": aluno.get('masteredKcs', 0),
            "forgotten_kcs": aluno.get('forgottenKcs', 0),
            "status": status
        })
    
    return alunos_processados

def main():
    print("🚀 EXTRAINDO DADOS DOS ALUNOS DE TODAS AS TURMAS")
    print("=" * 60)
    
    todas_turmas_com_alunos = []
    
    for i, turma in enumerate(TURMAS, 1):
        print(f"\n📊 Turma {i}/{len(TURMAS)}: {turma['nome']} (GUID: {turma['guid']})")
        
        # Extrair dados brutos
        dados_brutos = extrair_dados_alunos(turma['guid'])
        
        if dados_brutos:
            # Processar dados
            alunos_processados = processar_dados_alunos(dados_brutos)
            
            print(f"   ✅ Encontrados {len(alunos_processados)} alunos")
            
            # Adicionar ao relatório geral
            turma_completa = {
                "turma_nome": turma['nome'],
                "turma_guid": turma['guid'],
                "alunos": alunos_processados,
                "total_alunos": len(alunos_processados)
            }
            todas_turmas_com_alunos.append(turma_completa)
            
            # Salvar dados da turma individualmente
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename_individual = f"alunos_{turma['guid']}_{timestamp}.json"
            with open(filename_individual, 'w', encoding='utf-8') as f:
                json.dump(alunos_processados, f, indent=2, ensure_ascii=False)
            
            print(f"   📁 Arquivo salvo: {filename_individual}")
        else:
            print(f"   ❌ Nenhum dado obtido para esta turma")
    
    # Salvar relatório completo de todas as turmas
    if todas_turmas_com_alunos:
        timestamp_final = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename_completo = f"blueberry_todas_turmas_alunos_{timestamp_final}.json"
        with open(filename_completo, 'w', encoding='utf-8') as f:
            json.dump(todas_turmas_com_alunos, f, indent=2, ensure_ascii=False)
        
        print(f"\n🎉 RELATÓRIO COMPLETO SALVO: {filename_completo}")
        print(f"📊 Total de turmas processadas: {len(todas_turmas_com_alunos)}")
        
        # Resumo geral
        total_alunos_geral = sum(turma['total_alunos'] for turma in todas_turmas_com_alunos)
        print(f"👥 Total de alunos encontrados: {total_alunos_geral}")
    else:
        print("\n❌ Nenhuma turma teve dados de alunos extraídos.")

if __name__ == "__main__":
    main()