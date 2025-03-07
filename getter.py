import os
from pathlib import Path
from datetime import datetime

def generate_knowledge_base(
    repo_path,
    output_file,
    ignored_dirs=None,
    ignored_files=None,
    ignored_extensions=None,
    max_file_size=100000  # 100KB
):
    # Configuración de ignorados por defecto para Django y Next.js
    if ignored_dirs is None:
        ignored_dirs = {
            # Comunes
            '__pycache__', '.git', '.github', '.vscode', '.idea',
            'venv', 'env', 'node_modules',
            # Django
            'migrations', 'staticfiles', 'media',
            # Next.js
            '.next', '.vercel', 'out', 'dist', 'build', 
            'coverage', '.cache', 'public',
            # components
            'components'
        }

    if ignored_files is None:
        ignored_files = {
            # Comunes
            '.env', '.env.local', '.env.production', '.gitignore',
            '.dockerignore', 'docker-compose.yml', 'yarn.lock',
            'package-lock.json', 'package.json', 'requirements.txt','getter.py',
            
            # Django
            'db.sqlite3', '.coverage',
            # Next.js
            'next.config.js', 'vercel.json', 'config.json', 'langflowAPI.ts'
        }

    if ignored_extensions is None:
        ignored_extensions = {
            # Comunes
            '.pyc', '.log', '.tmp', '.swp', '.swo', '.db','.mjs','.md',
            # Media/Binarios
            '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
            '.webp', '.mp3', '.mp4', '.zip', '.tar', '.gz','.css'
        }

    repo_path = Path(repo_path).resolve()
    output_path = repo_path / output_file

    with open(output_path, 'w', encoding='utf-8') as outfile:
        # Encabezado
        outfile.write(f"# Knowledge Base for {repo_path.name}\n")
        outfile.write(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        file_count = 0
        skipped_files = 0

        for root, dirs, files in os.walk(repo_path):
            # Filtrar directorios ignorados
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            
            # Estructura de directorios
            level = root.replace(str(repo_path), '').count(os.sep)
            indent = ' ' * 4 * level
            rel_path = os.path.relpath(root, repo_path)
            
            if rel_path == '.':
                outfile.write("\n## Root Directory\n")
            else:
                outfile.write(f"\n{indent}📁 {os.path.basename(root)}/\n")

            # Procesar archivos
            for file in files:
                file_ext = os.path.splitext(file)[1].lower()
                
                # Verificar reglas de ignorado
                if (file in ignored_files or 
                    file_ext in ignored_extensions or 
                    file.startswith('.')):
                    skipped_files += 1
                    continue
                
                file_path = Path(root) / file
                
                # Verificar tamaño del archivo
                try:
                    if file_path.stat().st_size > max_file_size:
                        skipped_files += 1
                        continue
                except OSError:
                    skipped_files += 1
                    continue

                # Leer y escribir contenido
                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                    
                    # Encabezado del archivo
                    outfile.write(f"\n{indent}    📄 {file}\n")
                    outfile.write(f"{indent}    Path: {rel_path}/{file}\n")
                    outfile.write(f"{indent}    {'-' * 50}\n")
                    outfile.write(f"{content}\n")
                    outfile.write(f"\n{indent}    {'-' * 50}\n")
                    
                    file_count += 1
                
                except (UnicodeDecodeError, PermissionError):
                    skipped_files += 1
                except Exception as e:
                    print(f"Error procesando {file_path}: {str(e)}")
                    skipped_files += 1

        # Resumen final
        outfile.write("\n\n## Resumen de Ejecución\n")
        outfile.write(f"Archivos procesados: {file_count}\n")
        outfile.write(f"Archivos omitidos: {skipped_files}\n")
        outfile.write(f"Tamaño máximo permitido: {max_file_size/1000} KB\n")
        outfile.write("Extensiones ignoradas: " + ", ".join(ignored_extensions) + "\n")
        outfile.write("Directorios ignorados: " + ", ".join(ignored_dirs) + "\n")

if __name__ == "__main__":
    repo_path = input("Ingrese la ruta completa del repositorio: ")
    output_file = "knowledge_base.md"
    
    generate_knowledge_base(repo_path, output_file)
    
    print(f"\nBase de conocimiento generada en: {Path(repo_path) / output_file}")