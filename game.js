class Humanoid{
    constructor(maxHp, posY, posX, domElement, className,speed){
        this.posY = posY;
        this.posX = posX;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.domElement = domElement;
        this.domElement.style.position = "absolute";
        $(this.domElement).css({
            top:  this.posY + "px",
            left: this.posX + "px"
        });
        this.domElement.classList.add(className);
        this.dir = 40;
        this.speed = speed;
    }


    draw(){
        $(this.domElement).css({
            top:  this.posY + "px",
            left: this.posX + "px"
        });
    }

    destroy(){
        this.domElement.remove();
    }
}



class Zombie extends Humanoid{
    draw(){
        let catOp = Game.Player.posY - this.posY;
        let catAd = Game.Player.posX - this.posX;
        let rad = Math.atan2(catOp,catAd);
        let angulo = rad*180/Math.PI;
        let dx = Game.Player.posX - this.posX;
        let dy = Game.Player.posY - this.posY;
        let dist = Math.hypot(dx, dy);

        this.dir = angulo+90;

        this.domElement.style.transform = `rotate(${this.dir}deg)`;


        this.posX += (dx / dist) * this.speed;
        this.posY += (dy / dist) * this.speed;

        $(this.domElement).css({
            top: this.posY + "px",
            left: this.posX + "px",
            transform: `rotate(${this.dir}deg)` 
        });

    }

}


class Player extends Humanoid{
    draw(){
        let catOp = Game.mouseY - Game.Player.posY; 
        let catAd = Game.mouseX - Game.Player.posX;

        let rad=Math.atan2(catOp,catAd);
        let angulo = rad*180/Math.PI;

        if (Game.keys[Game.keyCodes.A]){

            Game.Player.posX = Game.Player.posX -this.speed;
        }

        if (Game.keys[Game.keyCodes.D]){
            Game.Player.posX = Game.Player.posX +this.speed;
        }

        if (Game.keys[Game.keyCodes.W]){
            Game.Player.posY = Game.Player.posY -this.speed;
        }

        if (Game.keys[Game.keyCodes.S]){
            Game.Player.posY = Game.Player.posY +this.speed;
        }

        $(this.domElement).css({
            top:  this.posY + "px",
            left: this.posX + "px"
        });

        this.dir = angulo;

        this.domElement.style.transform = `rotate(${this.dir}deg)`;
    }
    fire(){
        Builder.buildProjectile();
    }
}


class Projectile{
    constructor(dir,speed,posY, posX,domElement,className){
        this.dir = dir;
        this.speed = speed;
        this.domElement = domElement;
        this.domElement.style.position = "absolute";
        this.posY = posY+25;
        this.posX = posX+25;

        $(this.domElement).css({
            top:  this.posY + "px",
            left: this.posX + "px"
        });
        this.domElement.classList.add(className);
        this.startPosY = this.posY;
        this.startPosX = this.posX;
        this.rad = this.dir * Math.PI / 180;
    }

    draw(){
        this.posX += Math.cos(this.rad) * this.speed;
        this.posY += Math.sin(this.rad) * this.speed;

        if (this.posY > Game.Player.posY +500){
            this.destroy()
        }else if(this.posY<Game.Player.posY - 500){
            this.destroy()
        }

        if (this.posX > Game.Player.posX +500){
            this.destroy()
        }else if(this.posX<Game.Player.posX - 500){
            this.destroy()
        }
        $(this.domElement).css({
            left: this.posX + "px",
            top:  this.posY + "px"
        });
    }

    destroy(){
        this.domElement.remove();
    }
}



class Builder{
    static buildPlayer(){
        let div = document.createElement("div");
        let p = new Player(100,0,0,div,"Player",5);
        let body = document.getElementById('game');
        body.appendChild(div);
        Game.elements.push(p);
        return p;
    }

    static buildZombie(){
        let div = document.createElement("div");
        let z = new Zombie(100,(Math.random() * (500 - 1) + 1),(Math.random() * (500 - 1) + 1),div,"Zombie",(Math.random() * ((3+(Game.waveNumber/3)) - 1) + 1));
        let body = document.getElementById('game');
        body.appendChild(div);
        Game.elements.push(z)
        return z;
    }

    static buildWave(){
        let numEnemies = Game.waveNumber + 5;
        for (let i = 0; i< numEnemies; i++) {
            Builder.buildZombie();
        }
        return;
    }

    static buildProjectile(){
        let div = document.createElement("div");
        let body = document.getElementById('game');
        let p = new Projectile(Game.Player.dir,30,Game.Player.posY,Game.Player.posX,div,'Projectile');
        body.appendChild(div)
        Game.elements.push(p);
        return p;
    }
}




class Game{
    static Player;
    static elements=[];
    static started = false;
    static keys =[]; 
    static rate = 20;
    static mouseX;
    static mouseY;
    static keyCodes = {
        W: 87,
        S: 83,
        D: 68,
        A: 65,
        ESPACO:32
    };
    static waveNumber = 1;


    static start(){
        if(Game.started==true){
            return;
        }

        document.addEventListener('mousemove', function(event) {
            Game.mouseX = event.clientX; 
            Game.mouseY = event.clientY;
        });
        let body= document.getElementById("game");
        body.addEventListener("click", function() {
            Game.Player.fire();
        });

        let p = Builder.buildPlayer();
        Game.Player = p;
        Builder.buildWave();

        Game.started = true;


        $(document).keydown(function(event){
            let key = event.which;
            Game.keys[key] = true;

        });

        $(document).keyup(function(event){
            let key = event.which;
            Game.keys[key] = false;
        });

        var interval = setInterval(Game.loop, Game.rate);
        return;
    }


    static loop(){
        Game.checkForHits(); 
        Game.draw();
        if(Game.waveEnded()==true){
            Game.waveNumber +=1;
            document.getElementById('waveCounter').textContent= Game.waveNumber;
            Builder.buildWave();
        }
        return;
    }

    static waveEnded(){
        let cont = 0;
        Game.elements.forEach(e=>{
            if(e instanceof Zombie){
                cont+=1;
                return false;
            }
        });
        if(cont==0){
            return true;
        }
        return false;
    }

    static draw(){
        Game.elements.forEach(element => {
            element.draw();
        });

        return;
    }

    static isColliding(a, b, hitbox = 30) {
        return Math.hypot(a.posX - b.posX, a.posY - b.posY-30) < hitbox;
    }

    static checkForHits(){
        let bullets = Game.elements.filter(e => e instanceof Projectile);
        let zombies = Game.elements.filter(e => e instanceof Zombie);

        bullets.forEach(bullet => {
            zombies.forEach(zombie => {

                if(Game.isColliding(bullet, zombie, 25)){

                    zombie.destroy();
                    bullet.destroy();


                    Game.elements = Game.elements.filter(e => e !== bullet && e !== zombie);
                }
            });
        });
    }

}
