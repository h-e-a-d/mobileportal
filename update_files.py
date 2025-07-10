#!/usr/bin/env python3
import os
import re
import glob
from pathlib import Path

def update_html_file(file_path):
    """Update a single HTML file with new navbar and script"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace the navbar section
        old_navbar = r'<nav class="navbar">\s*<div class="nav-container">\s*<div class="nav-logo">\s*<a href="../../index\.html">\s*<h1>CrazyGames</h1>\s*</a>\s*</div>\s*<div class="nav-actions">\s*<a href="../../index\.html" class="btn btn-secondary">Back to Home</a>\s*</div>\s*</div>\s*</nav>'
        
        new_navbar = '''<nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="../../index.html">
                    <h1>SuperGames</h1>
                </a>
            </div>
            <div class="nav-search">
                <input type="text" id="searchInput" placeholder="Search games...">
            </div>
            <div class="nav-actions">
                <a href="../../index.html" class="btn btn-secondary">Back to Home</a>
            </div>
        </div>
    </nav>'''
        
        # Replace the navbar (more flexible approach)
        navbar_pattern = r'<nav class="navbar">.*?</nav>'
        if re.search(navbar_pattern, content, re.DOTALL):
            content = re.sub(navbar_pattern, new_navbar, content, flags=re.DOTALL)
        
        # Update GTM placeholders
        content = content.replace('GTM-XXXXXXX', 'GTM-PK768FJP')
        
        # Add script tag before closing body tag if not already present
        if '../../src/js/utils/header.js' not in content:
            script_tag = '\n    <script src="../../src/js/utils/header.js"></script>'
            content = content.replace('</body>', script_tag + '\n</body>')
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all HTML files"""
    games_dir = Path("/workspaces/mobileportal/games")
    html_files = list(games_dir.glob("**/*.html"))
    
    updated_files = []
    error_files = []
    
    print(f"Found {len(html_files)} HTML files to process...")
    
    for file_path in html_files:
        try:
            if update_html_file(file_path):
                updated_files.append(str(file_path))
                print(f"Updated: {file_path}")
            else:
                print(f"No changes needed: {file_path}")
        except Exception as e:
            error_files.append((str(file_path), str(e)))
            print(f"Error with {file_path}: {e}")
    
    print(f"\nSummary:")
    print(f"Total files found: {len(html_files)}")
    print(f"Files updated: {len(updated_files)}")
    print(f"Files with errors: {len(error_files)}")
    
    if updated_files:
        print(f"\nFirst 10 updated files:")
        for i, file_path in enumerate(updated_files[:10]):
            print(f"{i+1}. {file_path}")
    
    if error_files:
        print(f"\nFiles with errors:")
        for file_path, error in error_files:
            print(f"- {file_path}: {error}")

if __name__ == "__main__":
    main()