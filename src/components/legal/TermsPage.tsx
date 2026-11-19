import { LegalLayout } from './LegalLayout';

export function TermsPage() {
  return (
    <LegalLayout
      title="Termos de Uso"
      intro="Estes termos explicam as regras de uso do Sorteiaê, uma ferramenta gratuita para sortear nomes e números. Ao usar o site, você concorda com eles."
      sections={[
        {
          id: 'servico',
          title: 'O que é o Sorteiaê',
          body: (
            <p>
              O Sorteiaê é uma ferramenta on-line e gratuita que realiza sorteios de nomes e de números diretamente no seu
              navegador, sem cadastro. O site não organiza sorteios, não recebe pagamentos, não guarda nem entrega prêmios e
              não tem relação com os sorteios que você realiza.
            </p>
          ),
        },
        {
          id: 'aleatoriedade',
          title: 'Como os resultados são gerados',
          body: (
            <>
              <p>
                Os resultados vêm do gerador criptográfico do navegador (Web Crypto API). Cada participante ou número
                elegível tem a mesma probabilidade de ser sorteado. A ordem da lista não interfere no resultado, e não há
                resultados programados ou sequências predefinidas.
              </p>
              <p>
                O resultado é definido no momento do clique em “Sortear”. A animação apenas revela o que já foi sorteado.
              </p>
            </>
          ),
        },
        {
          id: 'responsabilidades',
          title: 'Suas responsabilidades',
          body: (
            <>
              <p>Ao usar o Sorteiaê, você se compromete a:</p>
              <ul>
                <li>usar a ferramenta de forma lícita e de boa-fé;</li>
                <li>ter autorização para usar os nomes de outras pessoas que incluir nos sorteios;</li>
                <li>não usar o site para fraudar, enganar participantes ou apresentar resultados falsos;</li>
                <li>não tentar prejudicar o funcionamento do site.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'legalidade',
          title: 'Promoções, rifas e prêmios',
          body: (
            <>
              <p>
                A responsabilidade pela legalidade de qualquer sorteio é de quem o organiza. No Brasil, a distribuição gratuita
                de prêmios por meio de sorteio em promoções comerciais depende de autorização prévia do Ministério da Fazenda,
                conforme a Lei nº 5.768/1971. Rifas e outras modalidades de sorteio com venda de participação podem configurar
                atividade ilegal.
              </p>
              <p>
                O uso do Sorteiaê não substitui nenhuma autorização exigida por lei. Em caso de dúvida, procure orientação
                jurídica antes de realizar o sorteio.
              </p>
            </>
          ),
        },
        {
          id: 'registros',
          title: 'Comprovação dos resultados',
          body: (
            <p>
              O histórico de sorteios fica salvo apenas no seu navegador e pode ser apagado a qualquer momento. O Sorteiaê não
              emite certificados nem guarda cópias dos resultados. Se você precisar comprovar um sorteio, recomendamos
              transmiti-lo ao vivo, gravar a tela ou realizá-lo na presença de testemunhas.
            </p>
          ),
        },
        {
          id: 'disponibilidade',
          title: 'Disponibilidade',
          body: (
            <p>
              O Sorteiaê é oferecido gratuitamente, no estado em que se encontra. Trabalhamos para que funcione bem, mas o site
              pode passar por instabilidades, manutenções, mudanças ou ser descontinuado, sem aviso prévio.
            </p>
          ),
        },
        {
          id: 'limites',
          title: 'Limitação de responsabilidade',
          body: (
            <p>
              Na máxima extensão permitida pela lei, o Sorteiaê não se responsabiliza por prejuízos decorrentes do uso dos
              resultados, de sorteios organizados por terceiros, de perda de dados guardados no navegador ou de
              indisponibilidade do site. Nada nestes termos afasta direitos garantidos pelo Código de Defesa do Consumidor.
            </p>
          ),
        },
        {
          id: 'marca',
          title: 'Marca e conteúdo',
          body: (
            <p>
              O nome Sorteiaê, a logo e a identidade visual do site pertencem aos seus responsáveis e não podem ser usados para
              sugerir parceria, patrocínio ou endosso sem autorização. Os resultados dos seus sorteios são seus.
            </p>
          ),
        },
        {
          id: 'privacidade',
          title: 'Privacidade',
          body: (
            <p>
              O tratamento de informações está descrito na <a href="#/privacidade">Política de Privacidade</a>, que faz parte
              destes termos.
            </p>
          ),
        },
        {
          id: 'alteracoes',
          title: 'Alterações e lei aplicável',
          body: (
            <p>
              Estes termos podem ser atualizados a qualquer momento, com a nova data indicada no topo da página. Eles são regidos
              pelas leis da República Federativa do Brasil.
            </p>
          ),
        },
      ]}
    />
  );
}
