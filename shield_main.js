function setOverrides(){
  return;
}

function calcMonsterHit(ignoreFreeze){
  // Reduce the damage based on the amount of armour
  var damage = game.monster.damage;
  var damageReduction = this.calculateDamageReduction(); // currently capped at 99%
  var newDamage = damage - Math.floor(damage * (damageReduction / 100));
  if (newDamage < 0) { newDamage = 0; }
  return (ignoreFreeze || (game.monster.canAttack && game.monster.alive)) ? newDamage:0;
}

//attacks a second relies on surviving the enemy hit(so hp * damage reduction), and how fast you can regen it.
function calcAttackSec(){
  var monsterhit = calcMonsterHit(0);
  return monsterhit/(game.player.getHp5()/5);
}

function calcAvgDamage(){
  var damage = game.player.getMinDamage();
  damage += (game.player.getMaxDamage() - damage)/2;
  return damage;
}
function calcExpSec(level){
  //todo fix this for monsterSpawn odds
  var avgMonsterHp = 11* (game.monsterCreator.monsterBaseHealth + level + Math.pow(1.35, level - 1));
  var avgMonsterExp = 2.875 * (game.monsterCreator.mosnterBaseExperienceWorth * Math.pow(1.08, level -1 ));
  var avgCritModifier = (game.player.getCritDamage()/100) * (game.player.getCritChance()/ 100);
  var avgMonsterKillSec = avgMonsterHP/(calcAvgDamage()*avgCritmodifier*calcAttackSec());
  return avgMonsterExp * avgMonsterKillSec;
}

function autoCombat(focus){
  if(game.inBattle){
    if(game.monster.rarity == MonsterRarity.COMMON || game.player.health/game.player.getMaxHealth() > .50){
      while(game.player.health > calcMonsterHit() && game.monster.health > 0){
        //if(focus==0 && game.monster.rarity != MonsterRarity.BOSS){  
          game.attack();
	      //}else {game.leaveBattle(); autoSell(); game.enterBattle();}
      }
    } else {
      game.enterBattle();
    }
  }
}

function autoSell(focus) {
 
 for(var x = 10; x < game.inventory.slots; x++){
   var i = game.inventory.slots[x];
   if(i!= null){
     var iR = i.itemRarity;
     
     if(focus==0){
     	switch(i.type){
     		case ItemType.HELM: if(game.equipment.helm().itemRarity < iR) game.equipment.equipItemInSlot(i,0,x); break;
        case ItemType.SHOULDERS: if(game.equipment.shoulders().itemRarity< iR)game.equipment.equipItemInSlot(i,1,x); break;
        case ItemType.CHEST: if(game.equipment.chest().itemRarity < iR) game.equipment.equipItemInSlot(i,2,x); break;
        case ItemType.LEGS: if(game.equipment.legs().itemRarity < iR) game.equipment.equipItemInSlot(i,3,x); break;
        case ItemType.WEAPON: if(game.equipment.weapon().maxDamage+game.equipment.weapon().damageBonus < i.maxDamage + i.damageBonus) {game.equipment.equipItemInSlot(i,4,x);} break;
        case ItemType.GLOVES: if(game.equipment.gloves().itemRarity < iR) game.equipment.equipItemInSlot(i,5,x); break;
        case ItemType.BOOTS: if(game.equipment.boots().itemRarity < iR) game.equipment.equipItemInSlot(i,6,x); break;
        case ItemType.TRINKET:
          if(game.equipment.trinket1().itemRarity < iR){game.equipment.equipItemInSlot(i,7,x); break;}
  	      if(game.equipment.trinket2().itemRarity < iR) game.equipment.equipItemInSlot(i,8,x); break;
        case ItemType.OFF_HAND: if(game.equipment.off_hand().itemRarity < iR) game.equipment.equipItemInSlot(i,9,x); break; 
     	}
     }
   }
   game.inventory.sellItem(x);
 }
}

function bestExpSec() {
  var target = 1;
  var expSec = 0;
  for(var i = 1; i <= game.player.level; i++){
    if(calcExpSec(i) >= expSec){
      target = i;
      expSec = calcExpSec(i);
    }
  }
  game.battleLevel=target;
}

function autoShield() {
  bestExpSec();
  game.enterBattle();
  autoCombat(0);
  autoSell(0);
  
  setTimeout(autoShield,100);
}

function SHIELDStart(){
  autoSell(0);
  autoShield();
}
