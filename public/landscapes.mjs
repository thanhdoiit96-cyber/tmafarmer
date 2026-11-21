const feature=(kind,x,y,w,h=w,flip=false)=>({kind,x,y,w,h,flip});
const terrain=(floor,points)=>({floor,points});
const tree=(x,y,w,flip)=>feature('banyan',x,y,w,w*.83,flip);
const fruitTree=(x,y,w,flip)=>feature('fruitTree',x,y,w,w*.86,flip);
const bed=(x,y,w,flip)=>feature('flowers',x,y,w,w*.57,flip);
const rock=(x,y,w,flip)=>feature('rocks',x,y,w,w*.55,flip);
const bamboo=(x,y,w,flip)=>feature('bamboo',x,y,w,w*1.09,flip);
const lamp=(x,y)=>feature('lantern',x,y,15,26);
const lotus=(x,y,w,flip)=>feature('lotus',x,y,w,w*.58,flip);
const reed=(x,y,w,flip)=>feature('reed',x,y,w,w*1.05,flip);

const field={
  floor:'meadow', road:'earth',
  tint:'#ffdb9416',
  terrain:[
    terrain('forest',[[0,0],[124,0],[104,64],[78,125],[59,222],[0,224]]),
    terrain('lakebank',[[510,64],[820,0],[820,376],[761,410],[620,382],[516,371],[494,276]]),
    terrain('forest',[[0,301],[80,309],[145,342],[161,390],[80,405],[0,470]]),
    terrain('meadow',[[58,46],[145,48],[155,81],[139,111],[77,115],[55,86]]),
    terrain('forest',[[418,27],[485,22],[512,75],[489,117],[433,117],[418,83]]),
    terrain('lakebank',[[119,151],[143,166],[140,200],[120,219],[103,196],[104,167]]),
    terrain('meadow',[[22,390],[797,390],[813,640],[18,640]]),
  ],
  pads:[
    {floor:'stone',x:77,y:65,w:58,h:31},
    {floor:'stone',x:365,y:124,w:65,h:44},
  ],
  decor:[
    bamboo(62,40,34),bamboo(69,214,28,true),bamboo(520,158,36),bamboo(709,82,53,true),
    bamboo(756,269,43),tree(796,366,66),fruitTree(682,292,49,true),reed(740,386,38),
    bed(76,88,18),bed(55,125,20),bed(130,111,18,true),bed(120,182,23),bed(366,193,20,true),
    bed(119,232,24,true),bed(307,258,30),bed(413,168,31,true),bed(92,301,30),bed(462,312,28,true),
    bed(565,112,31),bed(703,277,23),bed(632,370,24),
    rock(22,161,20,true),rock(61,168,17),rock(27,286,27),rock(389,249,17),rock(709,213,23),rock(739,335,28,true),
    lamp(128,96),lamp(364,169),lamp(696,387),
    lotus(41,155,16,true),lotus(44,179,14),
  ],
  life:[
    {kind:'butterfly',x:119,y:185},{kind:'butterfly',x:371,y:191},{kind:'butterfly',x:471,y:310},{kind:'dragonfly',x:587,y:246},
  ],
};
const scenes={
  home:{decor:[],life:[]},
  workshop:{decor:[],life:[]},
  field,
  visit:{
    ...field,road:'trail',tint:'#6fb2a723',
    decor:[...field.decor.filter(item=>!['flowers'].includes(item.kind)),
      bamboo(39,63,33,true),bamboo(446,85,31),bamboo(746,303,36),
      bed(75,90,17),bed(130,110,17,true),bed(134,207,19,true),bed(371,61,22,true),
      bed(419,207,31,true),bed(494,251,25),bed(717,263,33),bed(690,391,22),
    ],
    life:[{kind:'dragonfly',x:85,y:141},{kind:'butterfly',x:146,y:211},{kind:'butterfly',x:375,y:66},{kind:'dragonfly',x:600,y:283}],
  },
  market:{
    floor:'forest',road:'stone',tint:'#eac28524',
    terrain:[
      terrain('stone',[[58,47],[424,49],[412,133],[399,225],[322,251],[174,248],[56,223],[69,148]]),
      terrain('forest',[[0,0],[93,0],[68,70],[58,147],[0,175]]),
      terrain('lakebank',[[420,80],[480,61],[480,269],[416,244],[395,177]]),
    ],
    pads:[
      {floor:'stone',x:61,y:100,w:333,h:139},
      {floor:'gravel',x:78,y:58,w:58,h:62},
      {floor:'gravel',x:196,y:55,w:81,h:57},
      {floor:'gravel',x:351,y:61,w:58,h:59},
    ],
    decor:[
      bed(69,135,23,true),bed(313,227,24),bed(189,186,23,true),bed(67,244,27),bed(160,242,22),bed(354,243,21,true),bed(434,243,21,true),
      rock(425,201,19),rock(151,237,14),rock(366,246,13,true),
      lamp(79,165),lamp(166,153),lamp(319,148),lamp(393,172),lamp(270,256),
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
      terrain('gravel',[[169,44],[301,43],[321,97],[305,112],[168,108],[153,74]]),
    ],
    pads:[{floor:'straw',x:77,y:103,w:262,h:100},{floor:'stone',x:353,y:132,w:54,h:49}],
    decor:[
      tree(32,62,61),bamboo(58,86,33,true),tree(103,63,53,true),bamboo(354,49,34),tree(405,63,64),
      tree(432,260,58),rock(24,184,25),rock(415,158,19),rock(317,257,28,true),bed(68,265,26),bed(130,237,21,true),
      bed(410,180,30),bed(354,243,25,true),bed(60,150,21),rock(70,186,14),lamp(354,222),feature('hay',365,258,31,27),
    ],
    life:[{kind:'butterfly',x:78,y:207},{kind:'dragonfly',x:429,y:137}],
  },
  neighbors:{
    floor:'forest',road:'trail',tint:'#78a08024',
    terrain:[
      terrain('meadow',[[59,28],[207,25],[260,57],[395,44],[421,152],[416,226],[313,240],[121,239],[55,202]]),
      terrain('lakebank',[[0,78],[70,75],[78,129],[21,177],[0,161]]),
      terrain('lakebank',[[410,53],[480,62],[480,177],[426,166]]),
    ],
    pads:[
      {floor:'meadow',x:54,y:37,w:143,h:70},
      {floor:'meadow',x:281,y:36,w:132,h:71},
      {floor:'meadow',x:54,y:145,w:143,h:47},
      {floor:'meadow',x:281,y:145,w:132,h:55},
    ],
    decor:[
      tree(45,52,67),tree(402,56,62,true),tree(44,225,69,true),tree(432,270,57),
      bamboo(80,51,37),bamboo(439,149,37,true),bamboo(17,172,36),
      bed(93,113,25,true),bed(378,116,31),bed(129,191,26),bed(328,260,25,true),
      bed(70,167,20),bed(406,193,21,true),rock(60,176,15,true),rock(414,198,14),
      rock(29,134,19,true),rock(442,176,24),lamp(202,128),lamp(270,123),lamp(407,227),
    ],
    life:[{kind:'butterfly',x:116,y:144},{kind:'butterfly',x:309,y:198},{kind:'butterfly',x:386,y:224}],
  },
  lake:{
    floor:'lakebank',road:'trail',tint:'#a1d6bd22',
    terrain:[
      terrain('forest',[[0,0],[592,0],[562,56],[472,74],[327,55],[196,73],[158,142],[103,239],[41,270],[0,248]]),
      terrain('meadow',[[0,282],[109,251],[198,277],[333,298],[464,281],[592,307],[720,276],[720,432],[0,432]]),
      terrain('stone',[[65,82],[144,79],[163,117],[152,151],[100,164],[66,137]]),
    ],
    pads:[
      {floor:'stone',x:66,y:100,w:75,h:55},
      {floor:'gravel',x:262,y:239,w:54,h:32},
      {floor:'stone',x:563,y:202,w:43,h:34},
    ],
    decor:[
      tree(54,93,82),tree(170,98,63,true),tree(304,59,62),tree(410,55,70,true),tree(523,58,70),
      tree(675,100,74,true),tree(699,339,69,true),tree(398,407,65),fruitTree(627,339,54),
      bamboo(52,248,42,true),bamboo(144,189,41),bamboo(511,43,41),bamboo(649,244,35,true),bamboo(187,417,51),reed(572,247,38),
      bed(119,166,27),bed(181,264,25,true),bed(256,261,18),bed(356,283,33),bed(488,262,30,true),bed(566,285,33),bed(538,391,23),
      rock(161,153,28),rock(206,211,24,true),rock(239,235,21),rock(369,242,21,true),rock(518,221,22),rock(622,208,24,true),
      lotus(255,165,30),lotus(283,196,24,true),lotus(348,208,30),lotus(486,188,38,true),lotus(515,190,28),lotus(552,127,25,true),
      lamp(88,144),lamp(143,273),lamp(272,276),lamp(607,239),
    ],
    life:[{kind:'dragonfly',x:225,y:208},{kind:'dragonfly',x:300,y:217},{kind:'dragonfly',x:466,y:214},{kind:'dragonfly',x:561,y:183},{kind:'butterfly',x:356,y:280}],
  },
};
export const landscapeFor=id=>scenes[id];
