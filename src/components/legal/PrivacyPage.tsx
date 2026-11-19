import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { STORAGE_KEYS } from '@/lib/legal';
import { LegalLayout } from './LegalLayout';

function EraseData() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" className="mt-1 rounded-full hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={() => setOpen(true)}>
        <Trash2 />
        Apagar meus dados deste navegador
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Apagar todos os dados?"
        description="Participantes, configurações, histórico, rodadas e preferência de tema salvos neste navegador serão apagados. Não é possível desfazer."
        confirmLabel="Apagar tudo"
        onConfirm={() => {
          try {
            STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
          } catch {
            /* armazenamento bloqueado: não há o que apagar */
          }
          window.location.hash = '#/';
          window.location.reload();
        }}
      />
    </>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Política de Privacidade"
      intro="O Sorteiaê foi feito para funcionar sem saber quem você é. Esta política explica, em linguagem direta, quais informações passam pelo site, onde ficam guardadas e como você controla tudo isso, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD)."
      sections={[
        {
          id: 'resumo',
          title: 'Resumo',
          body: (
            <ul>
              <li>Não pedimos cadastro, login, e-mail ou qualquer dado pessoal seu.</li>
              <li>Os nomes, números e resultados dos seus sorteios ficam somente no seu aparelho.</li>
              <li>Nada do que você digita é enviado para servidores do Sorteiaê.</li>
              <li>Não usamos cookies, ferramentas de análise, anúncios ou rastreadores.</li>
            </ul>
          ),
        },
        {
          id: 'dados',
          title: 'Quais informações passam pelo site',
          body: (
            <>
              <p>Ao usar o Sorteiaê, você pode informar:</p>
              <ul>
                <li>nomes de participantes, que podem ser seus ou de outras pessoas;</li>
                <li>intervalos e quantidades para sorteios de números;</li>
                <li>preferências, como o tema claro ou escuro e as regras do sorteio.</li>
              </ul>
              <p>
                Essas informações são processadas pelo próprio navegador, no seu aparelho. O sorteio é calculado ali mesmo,
                com o gerador criptográfico do navegador (Web Crypto). Não existe um banco de dados do Sorteiaê recebendo
                esse conteúdo.
              </p>
            </>
          ),
        },
        {
          id: 'armazenamento',
          title: 'O que fica salvo no seu navegador',
          body: (
            <>
              <p>
                Para que você não perca seu trabalho ao recarregar a página, o Sorteiaê usa o armazenamento local do
                navegador (<code>localStorage</code>) para guardar a lista de participantes, as configurações, o histórico
                dos últimos 200 sorteios, o estado da rodada atual, um sorteio em andamento e o tema escolhido.
              </p>
              <p>
                Esses dados não saem do seu aparelho e não são acessíveis por outros sites. Eles ficam salvos até que você os
                apague. Para isso, você pode:
              </p>
              <ul>
                <li>usar “Limpar lista” e “Limpar histórico” dentro do próprio Sorteiaê;</li>
                <li>limpar os dados de navegação do seu navegador;</li>
                <li>usar o botão abaixo, que apaga de uma vez tudo o que o Sorteiaê guardou neste navegador.</li>
              </ul>
              <EraseData />
            </>
          ),
        },
        {
          id: 'cookies',
          title: 'Cookies e rastreamento',
          body: (
            <p>
              O Sorteiaê não usa cookies, pixels, ferramentas de análise de audiência, anúncios ou qualquer forma de
              rastreamento. As fontes e imagens do site são servidas junto com ele, sem chamadas a serviços de terceiros.
            </p>
          ),
        },
        {
          id: 'hospedagem',
          title: 'Hospedagem e registros técnicos',
          body: (
            <p>
              Para entregar as páginas do site, o provedor de hospedagem pode registrar automaticamente informações técnicas
              de acesso, como endereço IP, data e hora, navegador e página solicitada. Esses registros são tratados pelo
              provedor para operar e proteger o serviço, conforme as regras dele e o Marco Civil da Internet
              (Lei nº 12.965/2014). Eles nunca incluem os nomes ou resultados dos seus sorteios.
            </p>
          ),
        },
        {
          id: 'terceiros',
          title: 'Nomes de outras pessoas',
          body: (
            <p>
              Ao incluir nomes de terceiros num sorteio, você é responsável por esse uso. Como esses nomes ficam apenas no seu
              aparelho, eles não são compartilhados pelo Sorteiaê. Recomendamos não incluir informações além do necessário
              para identificar os participantes, como documentos, telefones ou dados sensíveis.
            </p>
          ),
        },
        {
          id: 'compartilhamento',
          title: 'Compartilhamento',
          body: (
            <p>
              O Sorteiaê não vende, aluga nem compartilha dados. Um resultado só sai do seu aparelho quando você mesmo decide,
              por exemplo ao usar “Copiar resultado” e colar em outro lugar.
            </p>
          ),
        },
        {
          id: 'seguranca',
          title: 'Segurança',
          body: (
            <p>
              Como os dados não são transmitidos nem armazenados em servidores do Sorteiaê, eles ficam protegidos pelas mesmas
              medidas de segurança do seu aparelho e navegador. Em computadores compartilhados, apague os dados ao terminar.
            </p>
          ),
        },
        {
          id: 'direitos',
          title: 'Seus direitos',
          body: (
            <p>
              A LGPD garante a você direitos como confirmação, acesso, correção e eliminação de dados. Como o Sorteiaê não
              coleta nem guarda seus dados em servidores, você exerce esses direitos diretamente: tudo está visível e editável
              na própria interface e pode ser apagado a qualquer momento, como descrito acima.
            </p>
          ),
        },
        {
          id: 'criancas',
          title: 'Crianças e adolescentes',
          body: (
            <p>
              O Sorteiaê não coleta dados de nenhum usuário, independentemente da idade. Ao usar nomes de crianças ou
              adolescentes em sorteios, recomendamos que isso seja feito por um responsável.
            </p>
          ),
        },
        {
          id: 'alteracoes',
          title: 'Alterações nesta política',
          body: (
            <p>
              Se o funcionamento do Sorteiaê mudar de forma que afete a privacidade, esta política será atualizada e a data no
              topo da página será alterada.
            </p>
          ),
        },
      ]}
    />
  );
}
