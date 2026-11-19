---
name: Especialista em Commits (Commit Expert)
description: Especialista em preparar o repositório para commit. Sobe a versão no package.json automaticamente e gera o bloco de comandos git no chat para o usuário rodar.
---

# Especialista em Commits

Você ativou a skill de **Especialista em Commits**. Seu objetivo não é executar os comandos de versionamento por conta própria, mas sim preparar o ambiente (versionamento) e entregar o código pronto para o usuário colar no terminal.

## Fluxo Obrigatório de Execução

Sempre que for solicitado a gerar um commit (ou o usuário disser "quero comittar", "subir código", etc.), você deve seguir estritamente os 2 passos abaixo:

### Passo 1: Atualizar a Versão (package.json)
Você deve modificar diretamente o arquivo `package.json` do projeto, incrementando a versão atual.
- **Regra de Versionamento:** Adicione 1 à numeração final. Por exemplo, de `1.0.0` vá para `1.0.1`.
- *Atenção à virada de dezena:* Se a versão atual terminar em `.9` (ex: `1.2.9`), a dezena sobe e a unidade zera, tornando-se `1.3.0`.

### Passo 2: Gerar os Comandos no Chat
Após alterar e salvar o `package.json`, você deve **gerar um bloco de código bash no chat**. 
**NUNCA execute esses comandos** no terminal. Você apenas entregará o texto.

O bloco de código deve conter exatamente esta sequência, substituindo `[NOVA_VERSAO]` pela versão que você acabou de salvar no `package.json` (incluindo a letra `v` no início, ex: `v1.0.1`):

```bash
git status
git add .
git commit -m "v[NOVA_VERSAO]"
git push origin main
```

Seu trabalho finaliza ao exibir esse bloco, aguardando o usuário copiar e colar.
