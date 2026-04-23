import subprocess
import sys
import os

# Mudar para o diretório do projeto
project_dir = r"c:\Users\Usuário\Desktop\PASTA VISUAL STUDIO"
os.chdir(project_dir)

print(f"Diretório: {os.getcwd()}")
print("-" * 50)

# Git add
print("\n[1/3] Adicionando mudanças...")
try:
    result = subprocess.run(["git", "add", "-A"], capture_output=True, text=True, timeout=30)
    print("OK - Mudanças adicionadas")
except Exception as e:
    print(f"ERRO: {e}")
    sys.exit(1)

# Git commit
print("\n[2/3] Fazendo commit...")
try:
    result = subprocess.run(
        ["git", "commit", "-m", "Deploy juslaboral - atualizado"],
        capture_output=True,
        text=True,
        timeout=30
    )
    if result.returncode == 0:
        print("OK - Commit realizado")
        print(result.stdout)
    else:
        print(f"ERRO: {result.stderr}")
except Exception as e:
    print(f"ERRO: {e}")
    sys.exit(1)

# Git push
print("\n[3/3] Fazendo push para GitHub...")
try:
    result = subprocess.run(
        ["git", "push", "origin", "main"],
        capture_output=True,
        text=True,
        timeout=60
    )
    if result.returncode == 0:
        print("OK - Push realizado com sucesso!")
        print(result.stdout)
    else:
        print(f"ERRO: {result.stderr}")
except Exception as e:
    print(f"ERRO: {e}")
    sys.exit(1)

# Verificar último commit
print("\n[4/4] Verificando último commit...")
try:
    result = subprocess.run(["git", "log", "--oneline", "-1"], capture_output=True, text=True, timeout=30)
    print(result.stdout)
except Exception as e:
    print(f"ERRO: {e}")

print("\n" + "=" * 50)
print("DEPLOY CONCLUÍDO COM SUCESSO!")
print("=" * 50)
