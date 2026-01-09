import os

# Nur echte Code-Dateien
EXTENSIONS = {'.ts', '.tsx', '.js', '.json', '.css'} 
# Explizit HTML ausschließen, da oft Reports
IGNORE_EXTENSIONS = {'.html', '.map'}

# Ordner, die wir ignorieren
IGNORE_DIRS = {
    'node_modules', '.git', 'dist', 'build', 'coverage', 
    '.vscode', '.idea', 'public' # public oft nur assets
}

OUTPUT_FILE = 'project_context_clean.txt'

def main():
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk('.'):
            # Verzeichnisse filtern
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                # Endung prüfen
                if any(file.endswith(ext) for ext in EXTENSIONS) and not any(file.endswith(ext) for ext in IGNORE_EXTENSIONS):
                    path = os.path.join(root, file)
                    # Überspringe große Dateien (> 1MB), z.B. package-lock.json
                    if os.path.getsize(path) > 1000000: 
                        continue
                        
                    try:
                        with open(path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            outfile.write(f"\n{'='*20}\nFILE: {path}\n{'='*20}\n")
                            outfile.write(content + "\n")
                    except Exception as e:
                        print(f"Skipping {path}: {e}")

    print(f"Fertig! Bitte lade '{OUTPUT_FILE}' hoch.")

if __name__ == "__main__":
    main()