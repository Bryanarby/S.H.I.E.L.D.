function setOverrides(){

}

function autoCombat(focus){
  if(game.inBattle){
    if(game.monster.rarity == MonsterRarity.COMMON || game.player.health/game.player.getMaxHealth() > .50){
      while(game.player.health > game.monster.damage){
        if(focus==0 && game.monster.rarity != MonsterRarity.BOSS){  
          game.attack();
	      }else {game.leaveBattle(); autoSell(); game.enterBattle();}
    }
  } else {
    game.enterBattle();
  }
}

function autoSell(focus) {
  function (){game.inventory.slots.forEach(function(i,x){
 if(i != null){
   var newSlotindex = null;
   var iR = i.itemRarity;
   
   //focus 0 = IR for now.
   if(focus == 0){
     //focus item rarity gear, only weapon focuses raw max power.
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
   game.inventory.sellItem(x);
 }
});}
}
function autoShield() {
  autoCombat(0);
  autoSell(0);
  
  setTimeout(autoShield,1000);
}

function SHIELDStart(){
  autoSell(0);
  autoShield();
}
