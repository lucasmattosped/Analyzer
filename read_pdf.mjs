import pdf from 'pdf-parse';
import fs from 'fs';

async function readPDF() {
  const dataBuffer = fs.readFileSync('/home/z/my-project/upload/Relatório (Maio)  4° - 2025 - Instituto IASW.pdf');
  
  try {
    const data = await pdf(dataBuffer);
    console.log('=== CONTEÚDO DO PDF ===');
    console.log('Número de páginas:', data.numpages);
    console.log('\n=== TEXTO EXTRAÍDO ===');
    console.log(data.text);
  } catch (error) {
    console.error('Erro ao ler PDF:', error);
    process.exit(1);
  }
}

readPDF();
