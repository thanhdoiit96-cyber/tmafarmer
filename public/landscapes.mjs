const feature=(kind,x,y,w,h=w,flip=false)=>({kind,x,y,w,h,flip});
const terrain=(floor,points)=>({floor,points});
const tree=(x,y,w,flip)=>feature('banyan',x,y,w,w*.83,flip);
const bed=(x,y,w,flip)=>feature('flowers',x,y,w,w*.57,flip);
const rock=(x,y,w,flip)=>feature('rocks',x,y,w,w*.55,flip);
const bamboo=(x,y,w,flip)=>feature('bamboo',x,y,w,w*1.09,flip);
const lamp=(x,y)=>feature('lantern',x,y,15,26);
const lotus=(x,y,w,flip)=>feature('lotus',x,y,w,w*.58,flip);

const field={
  floor:'meadow', road:'earth',
  tint:'#f8d48112',
  terrain:[
    terrain('forest',[[0,0],[124,0],[88,91],[72,167],[57,223],[0,224]]),
    terrain('lakebank',[[510,64],[820,0],[820,376],[761,410],[620,382],[516,371],[494,276]]),
    terrain('forest',[[0,301],[91,314],[202,346],[210,392],[84,399],[0,470]]),
    terrain('stone',[[84,28],[134,27],[150,52],[143,111],[93,117],[73,83]]),
    terrain('stone',[[346,106],[428,91],[455,134],[442,167],[370,179],[345,146]]),
    terrain('meadow',[[34,389],[797,390],[813,640],[18,640]]),
  ],
  decor:[
    tree(18,54,63),tree(50,89,53,true),tree(26,237,65,true),tree(456,75,69),tree(90,350,83),tree(160,330,62,true),tree(416,380,56),
    bamboo(62,40,34),bamboo(69,214,28,true),bamboo(520,158,36),bamboo(709,82,63,true),
    bamboo(756,269,51),bamboo(716,331,40,true),tree(779,119,77,true),tree(796,366,73),bamboo(810,446,53,true),
    bed(78,78,27),bed(55,125,18),bed(120,182,23),bed(216,127,16),bed(366,193,19,true),
    bed(119,232,26,true),bed(307,258,34),bed(413,168,34,true),bed(92,301,35),bed(462,312,31,true),
    bed(565,112,37),bed(703,277,26),bed(632,370,25),bed(799,460,28),
    rock(22,161,19,true),rock(61,168,16),rock(27,286,32),rock(389,249,17),rock(476,144,27,true),rock(709,213,25),rock(739,335,31,true),
    lamp(100,88),lamp(364,169),lamp(508,222),lamp(696,387),
    lotus(41,155,14,true),lotus(44,179,13),
  ],
  life:[
    {kind:'butterfly',x:119,y:185},{kind:'butterfly',x:371,y:191},{kind:'butterfly',x:471,y:310},{kind:'dragonfly',x:587,y:246},
  ],
};
const scenes={
  home:{decor:[],life:[]},
  workshop:{decor:[],life:[]},
  field, visit:field,
  market:{
    floor:'meadow',road:'stone',tint:'#e7b97718',
    terrain:[
      terrain('stone',[[58,47],[424,49],[412,133],[399,225],[322,251],[174,248],[56,223],[69,148]]),
      terrain('forest',[[0,0],[93,0],[68,70],[58,147],[0,175]]),
      terrain('lakebank',[[420,80],[480,61],[480,269],[416,244],[395,177]]),
    ],
    decor:[
      tree(30,56,63),tree(449,66,68,true),tree(30,213,64,true),tree(452,273,65),
      bamboo(24,133,43,true),bamboo(448,127,33),rock(425,201,20),bed(69,135,28,true),bed(313,227,28),
      bed(189,186,27,true),bed(67,244,33),bed(434,243,24,true),
      lamp(79,165),lamp(166,153),lamp(319,148),lamp(393,172),lamp(205,256),lamp(270,256),
      feature('bunting',153,111,100,14),feature('bunting',341,113,106,15),
      feature('basket',124,111,15,13),feature('basket',291,103,17,13,true),feature('basket',362,112,15,12),
    ],
    life:[{kind:'butterfly',x:79,y:151},{kind:'butterfly',x:356,y:203}],
  },
  coop:{
    floor:'meadow',road:'earth',tint:'#e8bd731d',
    terrain:[
      terrain('forest',[[0,0],[164,0],[144,62],[79,106],[54,174],[0,189]]),
      terrain('forest',[[343,0],[480,0],[480,108],[421,105],[374,75]]),
      terrain('stone',[[84,102],[333,102],[349,160],[319,201],[100,207],[74,150]]),
    ],
    decor:[
      tree(32,62,66),bamboo(58,86,39,true),tree(103,63,59,true),bamboo(354,49,40),tree(405,63,72),tree(471,102,62,true),
      tree(432,260,64),rock(24,184,28),rock(415,158,20),rock(317,257,32,true),bed(68,265,29),bed(130,237,23,true),
      bed(410,180,34),bed(354,243,28,true),lamp(354,222),
    ],
    life:[{kind:'butterfly',x:78,y:207},{kind:'dragonfly',x:429,y:137}],
  },
  neighbors:{
    floor:'forest',road:'trail',tint:'#41684f15',
    terrain:[
      terrain('meadow',[[59,28],[207,25],[260,57],[395,44],[421,152],[416,226],[313,240],[121,239],[55,202]]),
      terrain('lakebank',[[0,78],[70,75],[78,129],[21,177],[0,161]]),
      terrain('lakebank',[[410,53],[480,62],[480,177],[426,166]]),
    ],
    decor:[
      tree(45,52,73),tree(402,56,67,true),tree(44,225,77,true),tree(432,270,63),
      bamboo(80,51,43),bamboo(439,149,43,true),bamboo(17,172,42),tree(186,251,80),
      bed(93,113,29,true),bed(378,116,38),bed(129,191,30),bed(328,260,29,true),
      rock(29,134,21,true),rock(442,176,28),rock(64,245,22),lamp(202,128),lamp(270,123),lamp(407,227),
    ],
    life:[{kind:'butterfly',x:116,y:144},{kind:'butterfly',x:309,y:198},{kind:'butterfly',x:386,y:224}],
  },
  lake:{
    floor:'lakebank',road:'trail',tint:'#a7d4aa14',
    terrain:[
      terrain('forest',[[0,0],[592,0],[562,56],[472,74],[327,55],[196,73],[158,142],[103,239],[41,270],[0,248]]),
      terrain('meadow',[[0,282],[109,251],[198,277],[333,298],[464,281],[592,307],[720,276],[720,432],[0,432]]),
      terrain('stone',[[65,82],[144,79],[163,117],[152,151],[100,164],[66,137]]),
    ],
    decor:[
      tree(54,93,90),tree(170,98,69,true),tree(304,59,69),tree(410,55,77,true),tree(523,58,77),
      tree(675,100,82,true),tree(677,161,68),tree(699,339,77,true),tree(398,407,72),
      bamboo(52,248,47,true),bamboo(144,189,47),bamboo(511,43,47),bamboo(649,244,39,true),bamboo(187,417,58),
      bed(119,166,32),bed(181,264,30,true),bed(356,283,38),bed(488,262,35,true),bed(566,285,38),bed(538,391,26),
      rock(161,153,32),rock(206,211,27,true),rock(239,235,24),rock(369,242,24,true),rock(518,221,25),rock(622,208,27,true),
      lotus(255,165,34),lotus(283,196,27,true),lotus(348,208,34),lotus(486,188,43,true),lotus(515,190,31),lotus(552,127,28,true),
      lamp(88,144),lamp(143,273),lamp(272,276),lamp(607,239),
    ],
    life:[{kind:'dragonfly',x:225,y:208},{kind:'dragonfly',x:300,y:217},{kind:'dragonfly',x:466,y:214},{kind:'dragonfly',x:561,y:183},{kind:'butterfly',x:356,y:280}],
  },
};
export const landscapeFor=id=>scenes[id];
