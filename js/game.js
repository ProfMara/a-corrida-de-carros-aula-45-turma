class Game{
    constructor(){
        this.botao = createButton("");
        
        this.tituloPlacar = createElement("h2");
        this.lugar1 = createElement("h2");
        this.lugar2 = createElement("h2");

    }
    posicionar(){
        this.botao.position(width*0.66, 100);
        this.botao.class("resetButton");
        
        //definir a posição do elemento
        this.tituloPlacar.position(width*0.33,50);
        this.tituloPlacar.class("resetText");
        this.tituloPlacar.html("PLACAR");

        this.lugar1.position(width * 0.33, 100);
        this.lugar1.class("leadersText");

        this.lugar2.position(width * 0.33, 150);
        this.lugar2.class("leadersText");
        
        //define o que ocorre quando clica nele
        this.botao.mousePressed(()=>{
            //indica a raiz do banco de dados
            database.ref("/").set({
                //escreve esses valores no banco
                gameState:0, playerCount:0,vencedores:0
            });
            //recarrega a página local
            window.location.reload();
        });
    }

    mostrarPlacar(){
        //MATRIZ DE OBJETOS DE JOGADORES
        var players = Object.values(allPlayers);
        console.log(players);
        var lugar1, lugar2;
        //situação 1: ninguém cruzou a linha de chegada
        if(players[0].rank == 0 && players[1].rank == 0){
            //primeiro lugar: jogador 0
            lugar1 = players[0].rank 
             + "&emsp;"
             + players[0].nome 
             + "&emsp;" 
             + players[0].score;
            //segundo lugar: jogador 1
            lugar2 = players[1].rank 
            + "&emsp;" 
            + players[1].nome 
            + "&emsp;" 
            + players[1].score;
        }
        //SITUAÇÃO B: o player 0 cruzou a linha de chegada
        if(players[0].rank == 1){
            //primeiro lugar: jogador 0
            lugar1 = players[0].rank 
             + "&emsp;"
             + players[0].nome 
             + "&emsp;" 
             + players[0].score;
            //segundo lugar: jogador 1
            lugar2 = players[1].rank 
            + "&emsp;" 
            + players[1].nome 
            + "&emsp;" 
            + players[1].score;
        }
        //SITUAÇÃO C: o player 1 cruzou a linha de chegada primeiro
        if(players[1].rank == 1){
            //primeiro lugar: jogador 1
            lugar1 = players[1].rank 
             + "&emsp;"
             + players[1].nome 
             + "&emsp;" 
             + players[1].score;
            //segundo lugar: jogador 0
            lugar2 = players[0].rank 
            + "&emsp;" 
            + players[0].nome 
            + "&emsp;" 
            + players[0].score;
        }

        this.lugar1.html(lugar1);
        this.lugar2.html(lugar2);
    }



    
    start(){
        //cria o objeto form da classe Form
        form = new Form();
        //chama o método exibir do formulário
        form.exibir();

        //cria uma instância de novo jogador
        player = new Player();
        //pega a quantidade de jogadores no bd
        player.getCount();

        //cria a sprite do carro1
        car1 = createSprite(width/2 - 100, height-100);
        car1.addImage("carro", carimg1);
        car1.scale = 0.07;

        //cria a sprite do carro2
        car2 = createSprite(width/2 + 100, height-100);
        car2.addImage("carro", carimg2);
        car2.scale = 0.07;

        //adiciona as duas sprites na matriz cars
        cars = [car1, car2];

        //definir os grupos....
        coins = new Group();
        fuels = new Group();

        //criando as sprites...
        this.addSprites(coins, coinImg, 35, 0.5);
        this.addSprites(fuels, fuelImg, 20, 0.02);

    }
    coletarMoeda(i){
        cars[i-1].overlap(coins, function(coletor, collected){
            //aumenta a pontuação
            player.score += 10;
            //escreve o novo valor no banco de dados
            player.update();
            collected.remove();
        });
    }
    coletarComb(i){
        cars[i-1].overlap(fuels, function(coletor, collected){
            collected.remove();
        });
    }

    addSprites(grupo, imagem, numero, tamanho){
        
        for(var i = 0; i < numero; i++){
           var x = random(width*0.33, width*0.666); 
           var y = random(-height*4, height-100);
           
           //cria a sprite
           var sprite = createSprite(x,y);
           //adiciona a imagem na sprite
           sprite.addImage(imagem);
           sprite.scale = tamanho;
           grupo.add(sprite);
        }

    }



    play(){
        form.esconder();
        Player.getInfo();
        this.posicionar();
        //checar se allPlayers tem valor
        if(allPlayers !== undefined){
            player.pegarVencedores();
            this.mostrarPlacar();
            //colocar a imagem da pista
            image (pista, 0, -height*5 , width, height*6);
            
            //guardar o indice da sprite do carro
            var i = 0;
            //repetir os códigos pelo número de props do objeto
            for(var plr in allPlayers){
                //guarda do banco de dados o valor x
                var x = allPlayers[plr].posX;
                //guarda do banco de dados o valor y
                var y = height - allPlayers[plr].posY;
                //muda a posição da sprite do carro
                cars[i].position.x = x;
                cars[i].position.y = y;
                //aumenta o i para posicionar o outro carro
                i++;
                //checa se o valor de i é igual ao índice do jogador
                if( i == player.indice ){
                    //pinta de vermelho
                    fill("red");
                    //desenha uma bola vermelha
                    ellipse(x,y,60);
                    //a câmera segue o jogador
                    camera.position.y = y;
                    //detecta a colisão entre o carro e a moeda
                    this.coletarMoeda(i);
                    //NÃO TRAPACEIEM NO DESAFIO >:(
                    this.coletarComb(i);
                    
                    linhaChegada = height * 6;
                    //checar se o player ultrapassou a linha de chegada
                    if(player.posicaoY > linhaChegada){
                        //aumentar o valor do rank do jogador
                        player.rank +=1;
                        //escrever esse novo valor no banco de dados
                        Player.atualizarVencedores(player.rank);
                        gameState = 2;
                        this.mostrarRank();
                    }
                }

            }
            //chamar o método controlar carro
            this.controlarCarro();
            //desenhar as sprites
            drawSprites();
        }
    }

    controlarCarro(){
        if(keyDown(UP_ARROW)){
            player.posicaoY += 10;
            player.update();
        }
        if(keyDown(LEFT_ARROW) && player.posicaoX > width*0.33){
            player.posicaoX -= 10;
            player.update();
        }
        if(keyDown(RIGHT_ARROW) && player.posicaoX < width*0.66){
            player.posicaoX += 10;
            player.update();
        }
    }

    //lê no banco de dados e copia o valor de gameState
    getState(){
        database.ref("gameState").on("value", function(data){
            gameState = data.val();
        })
    }

    //atualiza o valor de gameState 
    update(state){
        database.ref("/").update({
            gameState:state,
        })
    }
   
   
    mostrarRank() {
        swal({
          title: "Incrível!! " +player.rank+ "º Lugar!" ,
          text: "Mamãe que legal gostou????",
          imageUrl:"https://i.pinimg.com/originals/92/b9/82/92b982f51088316de66a2c537106cb2d.gif",
          imageSize: "100x100",
          confirmButtonText: "Ok"
        });
      }

}