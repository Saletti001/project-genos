const fs = require('fs');
const path = require('path');
const solc = require('solc');

function compileContract(fileName) {
  const filePath = path.join(__dirname, '../contracts', fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const sourceCode = fs.readFileSync(filePath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      [fileName]: {
        content: sourceCode
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };

  console.log(`Compiling ${fileName}...`);
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasErrors = false;
    for (const error of output.errors) {
      console.log(error.formattedMessage);
      if (error.severity === 'error') {
        hasErrors = true;
      }
    }
    if (hasErrors) {
      console.error(`Compilation of ${fileName} FAILED!`);
      process.exit(1);
    }
  }

  console.log(`Compilation of ${fileName} succeeded!`);
}

// Compile both contracts
compileContract('GenosPlazaComercio.sol');
compileContract('GenosTorneos.sol');
console.log('All contracts compiled successfully!');
