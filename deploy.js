const { execSync } = require('child_process');
const path = require('path');

// Caminho para a pasta dist
const distPath = path.join(__dirname, 'dist');

// Comandos para fazer o deploy
try {
  // Inicializar um novo repositório na pasta dist
  execSync('git init', { cwd: distPath });
  
  // Adicionar todos os arquivos
  execSync('git add -A', { cwd: distPath });
  
  // Commit
  execSync('git commit -m "Deploy frontend"', { cwd: distPath });
  
  // Adicionar remote (ajuste a URL conforme necessário)
  execSync('git remote add origin git@github.com:lipegoose/mr-crm-bolt.git', { cwd: distPath });
  
  // Push forçado para a branch deploy-front
  execSync('git push -f origin master:deploy-front', { cwd: distPath });
  
  console.log('Deploy concluído com sucesso!');
} catch (error) {
  console.error('Erro durante o deploy:', error.message);
}