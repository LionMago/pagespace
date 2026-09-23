# Xatspace — Game of Thrones

Página estática para GitHub Pages: paisagem de inverno → abertura oficial ao clicar → perfil ao terminar. Sem instalação ou build.

## Personalização

Edite `config.js`: `name`, `bio` e `videoUrl`. O nome atual é provisório. A abertura usa o MP4 fornecido pelo cliente em um player HTML5, com controles e botão para pular em caso de bloqueio. A resolução é a do arquivo de origem; o código não converte para 4K. O evento `ended` abre o perfil. Ao pular a abertura, o áudio continua do mesmo ponto na parte interna; ao terminar, a faixa se repete. O botão no rodapé permite pausar/retomar a música. Voltar à paisagem pausa o áudio.

## GitHub Pages

Envie `index.html`, `style.css`, `app.js`, `fire-transition.js`, `video-gallery.js`, `motion.js`, `page-flame.js`, `config.js`, `favicon.svg`, `.nojekyll` e a pasta `assets` ao repositório. Em Settings → Pages, selecione a publicação pela branch e a pasta `/ (root)`. Utilize o endereço HTTPS publicado pelo GitHub, não a URL de visualização do arquivo no repositório.

A integração no xat.com deve usar o método de incorporação permitido pela configuração do seu xatspace. Ainda é necessário validar o tema dentro do xat.com: as permissões do iframe podem afetar reprodução, áudio e navegação. Não cole o JavaScript diretamente no editor como substituto da página hospedada.

## Prévia

Execute `node preview.cjs` e abra http://localhost:4173. O player precisa de acesso à internet. `file://` não é adequado para testar a abertura incorporada.

## Arte

Cenário com dois castelos e dragões gerados por IA. Névoa e neve animadas no navegador; dragões com ciclo de poses de asas, em sprites. Não é renderização 3D em tempo real. Veja `assets/PROMPTS.md` para prompts e dimensões entregues, e `assets/SOURCES.md` para fontes dos retratos e referências visuais.

## Referências de movimento
- GSAP Timeline: https://gsap.com/docs/v3/GSAP/Timeline/ — biblioteca GSAP 3.13.0 incluída em assets/vendor, com cabeçalho de licença original preservado. Sequência de entrada escrita para este projeto.
- Codrops Shader Image Reveal: https://tympanus.net/Tutorials/ShaderImageReveal/ — referência conceitual de revelação; nenhum código do demo foi copiado.
- Three.js lava shader: https://threejs.org/examples/webgl_shader_lava.html — referência de textura em movimento. O fogo do projeto usa shader WebGL próprio, sem Three.js.
Os demais links enviados foram consultados como catálogo de referências. O conteúdo dos exemplos individuais da coleção CodePen não estava acessível pela leitura textual.

## Validação pendente no xatspace
Erro 153 do YouTube pode depender da identificação de origem do iframe hospedeiro. A reprodução local não valida o xatspace; é necessário o link público exato para verificar sua incorporação. video-gallery.js trata erros pela API oficial sem simular origem de outro site.
