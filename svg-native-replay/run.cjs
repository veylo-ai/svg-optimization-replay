const fs=require('fs'),crypto=require('crypto');
const root='/tmp/svg-native/node_modules/svgo';
const {optimize}=require('module').createRequire('/tmp/svg-native/package.json')('svgo');
const fixtures=JSON.parse(fs.readFileSync('svg-native-replay/fixtures.json','utf8'));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const configs=[
{name:'default',options:{}},
{name:'both_on',options:{plugins:[{name:'preset-default',params:{overrides:{mergeStyles:true,inlineStyles:true}}}]}},
{name:'merge_off',options:{plugins:[{name:'preset-default',params:{overrides:{mergeStyles:false,inlineStyles:true}}}]}},
{name:'inline_off',options:{plugins:[{name:'preset-default',params:{overrides:{mergeStyles:true,inlineStyles:false}}}]}},
{name:'both_off',options:{plugins:[{name:'preset-default',params:{overrides:{mergeStyles:false,inlineStyles:false}}}]}}
];
const cases=[];
for(const key of ['source_media_attribute','source_explicit_wrapper']){
 for(const cfg of configs){
 const input=fixtures[key],before=sha(input);
 const result=optimize(input,cfg.options);
 cases.push({inputKey:key,config:cfg.name,options:cfg.options,input,inputSha256:before,inputUnchanged:sha(input)===before,output:result.data,outputSha256:sha(result.data)});
 }
}
const files={};
for(const p of ['package.json','plugins/mergeStyles.js','plugins/inlineStyles.js','LICENSE']){
 const b=fs.readFileSync(root+'/'+p);files[p]={bytes:b.length,sha256:sha(b),text:b.toString()};
}
const entry=fs.readFileSync(root+'/dist/svgo-node.cjs');
files['dist/svgo-node.cjs']={bytes:entry.length,sha256:sha(entry)};
const lock=fs.readFileSync('/tmp/svg-native/package-lock.json');
fs.writeFileSync('/tmp/svg-native-result.json',JSON.stringify({identity:'Veylo synthetic same-input SVGO replay; no customer result',node:process.version,platform:process.platform,package:JSON.parse(files['package.json'].text).version,lockSha256:sha(lock),lock:JSON.parse(lock),files,cases},null,2));
console.log(cases.map(c=>({input:c.inputKey,config:c.config,output:c.output})));
