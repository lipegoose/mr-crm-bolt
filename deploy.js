// deploy.js - usando execa
import { execa } from 'execa';
import { fileURLToPath } from 'url';
import path from 'path';

// Obter o __dirname equivalente em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para a pasta dist
const distPath = path.join(__dirname, 'dist');

// Função para executar comandos
async function run() {
  try {
    // Inicializar um novo repositório na pasta dist
    await execa('git', ['init'], { cwd: distPath });
    
    // Adicionar todos os arquivos
    await execa('git', ['add', '-A'], { cwd: distPath });
    
    // Commit (ignorando erro se não houver mudanças)
    try {
      await execa('git', ['commit', '-m', 'Deploy frontend'], { cwd: distPath });
    } catch (e) {
      console.log('Nenhuma mudança para commit ou erro no commit');
    }
    
    // Adicionar remote (ignorando erro se já existir)
    try {
      await execa('git', ['remote', 'add', 'origin', 'git@github.com:lipegoose/mr-crm-bolt.git'], { cwd: distPath });
    } catch (e) {
      console.log('Remote já existe ou erro ao adicionar');
    }
    
    // Push forçado para a branch deploy-front
    await execa('git', ['push', '-f', 'origin', 'master:deploy-front'], { 
      cwd: distPath,
      stdio: 'inherit' // Mostrar output no console
    });
    
    console.log('Deploy concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o deploy:', error.message);
  }
}

run();