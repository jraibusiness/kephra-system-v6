"""Ajusta HTML para o que o Gmail preserva: troca `background:` abreviado (o Gmail apaga) por `background-color:`."""
import re, sys


def gmail_safe(html):
    return re.sub(r'background:\s*(#[0-9A-Fa-f]{3,8}|[a-z]+)', r'background-color:\1', html)


if __name__ == '__main__':
    p = sys.argv[1]
    src = open(p).read()
    if not src.strip():
        sys.exit(f'{p}: arquivo vazio, nada a ajustar')
    with open(p, 'w') as f:
        f.write(gmail_safe(src))
