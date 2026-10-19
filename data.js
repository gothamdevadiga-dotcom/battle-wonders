const TYPES = {
  fire:{grass:2,ice:2,water:.5,rock:.5,dragon:.5,fire:.5},
  water:{fire:2,rock:2,water:.5,grass:.5,dragon:.5},
  grass:{water:2,rock:2,fire:.5,grass:.5,dragon:.5},
  electric:{water:2,grass:.5,dragon:.5,electric:.5},
  rock:{fire:2,ice:2,grass:.5},
  ghost:{ghost:2,psychic:2},
  ice:{grass:2,dragon:2,fire:.5,ice:.5,water:.5},
  dragon:{dragon:2},
  psychic:{electric:2,psychic:.5},
  normal:{}
};

// moves: [name, type, power, poisonChance?]
const CREATURES = [
  {id:'embrix',name:'Embrix',type:'fire',base:[50,60,40,65],color:'#e8643a',shape:'ears',
   moves:[['Ember Rush','fire',60],['Flame Burst','fire',85],['Quick Dash','normal',40],['Tail Swing','normal',55]]},
  {id:'aquill',name:'Aquill',type:'water',base:[55,50,55,50],color:'#3d86d6',shape:'round',
   moves:[['Splash Jet','water',60],['Tidal Crash','water',85],['Bubble Wave','water',40],['Slam','normal',55]]},
  {id:'thornet',name:'Thornet',type:'grass',base:[55,55,50,45],color:'#55a84a',shape:'spiky',
   moves:[['Leaf Lash','grass',60],['Vine Crush','grass',85],['Venom Spray','grass',35,.4],['Tackle','normal',40]]},
  {id:'voltkit',name:'Voltkit',type:'electric',base:[40,55,35,90],color:'#e8b400',shape:'ears',
   moves:[['Spark','electric',60],['Thunder Jolt','electric',85],['Volt Tackle','normal',40],['Static Shock','electric',45]]},
  {id:'boulderon',name:'Boulderon',type:'rock',base:[65,65,75,30],color:'#9c8552',shape:'round',
   moves:[['Rock Toss','rock',60],['Stone Edge','rock',85],['Body Slam','normal',55],['Rock Blast','rock',40]]},
  {id:'shadlet',name:'Shadlet',type:'ghost',base:[45,60,45,70],color:'#6d5a9a',shape:'tall',
   moves:[['Shade Claw','ghost',60],['Haunt Strike','ghost',85],['Night Pulse','ghost',40,.3],['Scratch','normal',40]]},
  {id:'frostynx',name:'Frostynx',type:'ice',base:[50,55,50,60],color:'#3fa8bb',shape:'spiky',
   moves:[['Icicle Shard','ice',60],['Blizzard Gust','ice',85],['Frost Bite','ice',40],['Quick Strike','normal',40]]},
  {id:'drakanth',name:'Drakanth',type:'dragon',base:[60,70,55,55],color:'#4b4fc4',shape:'spiky',
   moves:[['Dragon Claw','dragon',60],['Dragon Pulse','dragon',85],['Iron Tail','normal',55],['Heavy Smash','normal',75]]},
  {id:'psyrel',name:'Psyrel',type:'psychic',base:[45,50,45,80],color:'#d2487c',shape:'round',
   moves:[['Psy Beam','psychic',60],['Mind Blast','psychic',85],['Mind Wave','psychic',40],['Quick Strike','normal',40]]}
];

const NAMES = ['Kael','Mira','Orin','Sable','Dex','Vera','Tobin','Ilse','Rook','Nyx',
  'Brando','Sol','Hana','Lucan','Iris','Dante','Yuna','Corin','Zed','Mako'];

module.exports = { TYPES, CREATURES, NAMES };