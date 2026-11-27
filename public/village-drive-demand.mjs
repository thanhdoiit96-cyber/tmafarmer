export const driveTemplates=[
  {title:'Giỏ nông sản',needs:{wheat:16,carrot:12,corn:12}},
  {title:'Bếp làng',needs:{sweetPotato:24,pumpkin:12,gooseEgg:9}},
  {title:'Quầy đặc sản',needs:{peanut:12,pumpkin:8,rabbitMeat:8}},
];

export function scaleDriveNeeds(needs,memberCount){
  if(!Number.isSafeInteger(memberCount)||memberCount<1)throw new RangeError('A drive needs at least one farm.');
  const factor=memberCount===1?.5:memberCount===2?.75:1;
  return Object.fromEntries(Object.entries(needs).map(([item,quantity])=>[item,Math.ceil(quantity*factor)]));
}

// A legacy drive must finish against the original quantities, even after this rollout.
export function driveNeeds(drive){
  return drive.version>=2&&drive.needs?drive.needs:driveTemplates[drive.template].needs;
}
