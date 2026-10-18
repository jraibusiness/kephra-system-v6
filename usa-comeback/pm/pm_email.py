"""Gera o HTML dos e-mails do gerente [USA-PM] com botões de resposta (mailto para os dois)."""
import json, sys, urllib.parse

T, O, G, X, R = '#1B7A7A', '#E17A18', '#F5F5F5', '#333333', '#B3261E'
TO = 'jr.conductor83@gmail.com,gandarp@gmail.com'


def mailto(subject, body):
    q = urllib.parse.urlencode({'subject': subject, 'body': body}, quote_via=urllib.parse.quote)
    return f'mailto:{TO}?{q}'


LIGHT = '#E3F1F1'  # fundo claro + texto/borda escuros: legível no modo claro e no escuro (Gmail iOS inverte cores)


def button(label, href):
    # Botão "à prova de cliente": célula de tabela com bgcolor + borda; nunca texto branco sobre fundo só no <a>.
    return (f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:3px 6px 3px 0">'
            f'<tr><td bgcolor="{LIGHT}" style="background-color:{LIGHT};border:2px solid {T};padding:8px 12px">'
            f'<a href="{href}" style="color:{T};text-decoration:underline;font-size:14px;font-weight:bold">{label}</a>'
            f'</td></tr></table>')


def decision(d):
    letters = 'ABCDEFG'
    btns = ''.join(button(f"{letters[i]} · {o['label']}", mailto(f"[USA-PM] Resposta {d['id']}", f"{d['id']}-{letters[i]}: {o['answer']}\n\nComentário (opcional): "))
                   for i, o in enumerate(d['options']))
    btns += button('✍️ Outra / comentar', mailto(f"[USA-PM] Resposta {d['id']}", f"{d['id']}: "))
    codes = ' · '.join(f"<b>{d['id']}-{letters[i]}</b> = {o['label']}" for i, o in enumerate(d['options']))
    btns += (f'<div style="font-size:12px;color:{X};margin-top:6px">Se os botões não abrirem: responda a este e-mail '
             f'escrevendo o código — {codes}</div>')
    who = f'<div style="font-size:11px;color:#888">👤 {d["who"]} · ⏱ responder até {d["due"]}</div>'
    return (f'<div style="background-color:{G};border-left:4px solid {d.get("color", T)};padding:12px 14px;margin:10px 20px">'
            f'<div style="font-size:11px;color:#888">{d["id"]}</div><div style="font-size:16px;font-weight:bold;color:{T}">{d["title"]}</div>'
            f'<div style="font-size:13px;margin:6px 0">{d["context"]}</div>{btns}{who}</div>')


def render(spec):
    head = (f'<div style="font-family:Arial,Helvetica,sans-serif;color:{X};max-width:680px;margin:auto">'
            f'<div style="background-color:{T};color:#fff;padding:16px 20px"><div style="font-size:12px;letter-spacing:1px">{spec["kicker"]}</div>'
            f'<div style="font-size:20px;font-weight:bold">{spec["title"]}</div></div>'
            f'<div style="padding:10px 20px;font-size:14px">{spec["intro"]}</div>')
    body = spec.get('pre', '') + ''.join(decision(d) for d in spec['decisions'])
    how = (f'<div style="padding:10px 20px;font-size:13px;color:{X}"><b>Como responder:</b> toque num botão (abre um e-mail já preenchido para os dois — é só enviar) '
           f'ou use <b>Responder a todos</b> e escreva os códigos (ex.: <b>D2-B, D1-A, D3-B, D4-A</b>). Decido sempre com as respostas <b>dos dois</b>; depois mando uma proposta para vocês confirmarem.</div>')
    foot = (f'<div style="font-size:11px;color:#888;padding:12px 20px;border-top:1px solid #eee">Gerente do projeto USA Comeback (Claude) · '
            f'rodadas seg–sáb ~8h e ~18h · quem não responder recebe lembrete.</div></div>')
    return head + body + how + foot


if __name__ == '__main__':
    sys.stdout.write(render(json.load(open(sys.argv[1]))))
