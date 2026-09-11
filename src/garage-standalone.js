import {buildGarageProject} from './garage-project.js?v=fbf1384afe';

const project=window.PARAMETRIC_SHOP?.projects.find(project=>project.id==='modular-garage');
const content=document.getElementById('garage-project');
if(project){
  document.getElementById('page-heading').textContent=project.title;
  document.getElementById('page-intro').textContent=project.summary;
  document.title=project.title+' — parametric.space';
  buildGarageProject(content,project);
}else{
  content.textContent='The project could not load. Please reload the page.';
}
