import os

def bundle_project(root_dir, output_file, ignore_dirs=None, ignore_exts=None):
    if ignore_dirs is None:
        ignore_dirs = {'.git', '__pycache__', 'node_modules', 'venv', '.vscode'}
    if ignore_exts is None:
        ignore_exts = {'.pyc', '.exe', '.bin', '.png', '.jpg', '.pdf'}

    with open(output_file, 'w', encoding='utf-8') as f_out:
        for root, dirs, files in os.walk(root_dir):
            # Filter out ignored directories
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            
            for file in files:
                if any(file.endswith(ext) for ext in ignore_exts):
                    continue
                
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, root_dir)
                
                f_out.write(f"\n--- FILE: {relative_path} ---\n")
                try:
                    with open(file_path, 'r', encoding='utf-8') as f_in:
                        f_out.write(f_in.read())
                except Exception as e:
                    f_out.write(f"[Could not read file: {e}]\n")
                f_out.write("\n")

if __name__ == "__main__":
    # Change '.' to your specific directory if needed
    bundle_project('.', 'project_summary.txt')
    print("Project bundled into project_summary.txt")
