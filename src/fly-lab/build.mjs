import {build} from 'esbuild';
await build({entryPoints:['app.js','specimen.js'],bundle:true,minify:true,format:'esm',target:'es2022',outdir:'../../fly-lab'});
