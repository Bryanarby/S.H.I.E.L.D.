function setOverrides(){
  return;
}

function mercEfficiency() {
  return mercs.map(function(m){
  	return {name : m.toUpperCase(), 
  	efficiency : game.mercenaryManager[m + 'Price'] / parseFloat(game.mercenaryManager.getGps().replace(/,/g,'')) 
  	           + game.mercenaryManager[m + 'Price'] / game.mercenaryManager.getMercenariesGps(m.toUpperCase())}
  	}).sort(function(a,b){return a.efficiency > b.efficiency});
}

function calcMonsterRarityOdds(battleLevel, battledepth){
	var rareChance = 0.001 + (battleLevel / 250);
        if (rareChance > 0.1) { rareChance = 0.1; }
        var eliteChance = 0;
        if (battleLevel >= 10) {
            eliteChance = 0.03 + (battleLevel / 6000);
            if (eliteChance > 0.05) { eliteChance = 0.05; }
        }
        var bossChance = 0;
        if (battleLevel >= 30) {
            bossChance = 0.03 + (battleLevel / 12000);
            if (bossChance > 0.01) { bossChance = 0.01; }
        }
        var normalChance = 1- (rareChance + eliteChance + bossChance);
	return[normalChance,
		rareChance,
		eliteChance,
		bossChance
	]
}
function calcMonsterHit(ignoreFreeze){
  // Reduce the damage based on the amount of armour
  var damage = game.monster.damage;
  var damageReduction = game.player.calculateDamageReduction(); // currently capped at 99%
  var newDamage = damage - Math.floor(damage * (damageReduction / 100));
  if (newDamage < 0) { newDamage = 0; }
  return (ignoreFreeze || (game.monster.canAttack && game.monster.alive)) ? newDamage:0;
}

//attacks a second relies on surviving the enemy hit(so hp * damage reduction), and how fast you can regen it.
function calcAttackSec(){
  var monsterhit = calcMonsterHit(1);
  return monsterhit/(game.player.getHp5()/5);
}

function calcAvgDamage(){
  var damage = game.player.getMinDamage();
  damage += (game.player.getMaxDamage() - damage)/2;
  return damage;
}
function calcExpSec(level){
  var rarityOdds = calcMonsterRarityOdds(level);
  var avgHp = ((rarityOdds[0]*1) + (rarityOdds[1]*3) + (rarityOdds[2]*10) + (rarityOdds[3]* 30));
  var avgExp = ((rarityOdds[0]*1) + (rarityOdds[1]*1.5) + (rarityOdds[2]*3) + (rarityOdds[3]* 6));
  var avgMonsterHp = avgHp* (game.monsterCreator.monsterBaseHealth + level + Math.pow(1.35, level - 1));
  var avgMonsterExp = avgExp * (game.monsterCreator.monsterBaseExperienceWorth * Math.pow(1.08, level -1 ));
  var avgCritModifier = (game.player.getCritDamage()/100) * (game.player.getCritChance()/ 100);
  var avgMonsterKillSec = avgMonsterHp/(calcAvgDamage()*avgCritModifier*calcAttackSec());
  return avgMonsterExp * avgMonsterKillSec;
}

function autoCombat(focus){
  if(game.inBattle){
    if(game.monster.rarity == MonsterRarity.COMMON || game.player.health/game.player.getMaxHealth() > .50){
      var level = game.player.level;
      var attackCounter = 1;
      while(game.player.health > calcMonsterHit() && game.monster.health > 0){
        //inventory full? too many attacks? take a break
        if(game.inventory.slots[25] != null | attackCounter >= 1000 ){
          break;
        }
        switch(focus){
        	case 0: while(game.monster.rarity != MonsterRarity.COMMON){
        		game.leaveBattle();game.enterBattle();
        	};break;
        	case 1: while(game.monster.rarity == MonsterRarity.COMMON){
        		game.leaveBattle();game.enterBattle();
        	};break;
        }
          game.attack();
          attackCounter++;
      }
    } 
  } 
  //the else case here can only join once we can decide the level we're fighting properly.
  /*else {
    game.enterBattle();	
  }*/
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
  for(var i = Math.floor(game.player.level/2); i <= game.player.level; i++){
    game.battleLevel=i;
    game.enterBattle();
  
    if(calcExpSec(i) >= expSec){
      target = i;
      expSec = calcExpSec(i);
    }
    game.leaveBattle();
  }
  game.battleLevel=target;
}

function autoShield() {
  //if(!game.inBattle)bestExpSec();
  autoCombat(0);
  autoSell(0);
  
  setTimeout(autoShield,1000);
}

function SHIELDStart(){
  autoSell(0);
  //bestExpSec();
  autoShield();
}
