import os
import re

blog_dir = 'src/content/blog'
library_dir = 'src/content/library'
output_images_dir = 'public/images'

missing_images = []

def check_files(directory, is_blog=True):
    for filename in os.listdir(directory):
        if not filename.endswith('.md'):
            continue
        
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Find prompts
            prompts = re.findall(r'📸 이미지 프롬프트:(.*?)-->', content, re.DOTALL)
            for p in prompts:
                save_as_match = re.search(r'save_as:\s*"([^"]*)"', p)
                if save_as_match:
                    img_name = save_as_match.group(1)
                    
                    if is_blog:
                        # Extract number from filename (e.g. 057_...)
                        num_match = re.match(r'(\d+)_', filename)
                        if num_match:
                            blog_num = num_match.group(1)
                            target_path = os.path.join(output_images_dir, 'blogs', blog_num, img_name)
                            if not os.path.exists(target_path):
                                missing_images.append((path, img_name, target_path))
                    else:
                        # For library, find slug in frontmatter or use filename
                        slug_match = re.search(r'slug:\s*"([^"]*)"', content)
                        if not slug_match:
                            slug_match = re.search(r'slug:\s*([^\n\r]*)', content)
                        
                        slug = slug_match.group(1).strip() if slug_match else filename.replace('.md', '')
                        target_path = os.path.join(output_images_dir, 'library', slug, img_name)
                        if not os.path.exists(target_path):
                            missing_images.append((path, img_name, target_path))

check_files(blog_dir, is_blog=True)
check_files(library_dir, is_blog=False)

print("Missing Images:")
for path, name, target in missing_images:
    print(f"File: {path} | Image: {name} | Expected Path: {target}")
