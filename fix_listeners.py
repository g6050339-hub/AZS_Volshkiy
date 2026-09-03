#!/usr/bin/env python3
"""Make all getElementById().addEventListener calls null-safe with optional chaining"""
path = '/root/AZS_Volshkiy/app.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

ids = [
    'city-modal-close',
    'city-modal-backdrop',
    'btn-locate',
    'btn-refresh',
    'btn-start-navi',
    'btn-stop-navi',
]

fixed = 0
for element_id in ids:
    old = f"getElementById('{element_id}').addEventListener"
    new = f"getElementById('{element_id}')?.addEventListener"
    if old in content:
        content = content.replace(old, new)
        fixed += 1
        print(f'Fixed: {element_id}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Total fixed: {fixed}')
