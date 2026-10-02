const fs = require('fs');

function replaceCurrency(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace $ followed by specific variable names with BDT
  content = content.replace(/\$\{currentUser/g, 'BDT {currentUser');
  content = content.replace(/\$\{requiredAmount/g, 'BDT {requiredAmount');
  content = content.replace(/\$\{tx\.amount/g, 'BDT {tx.amount');
  content = content.replace(/\$\{\(/g, 'BDT {(');
  content = content.replace(/\$\{Number/g, 'BDT {Number');
  content = content.replace(/\$\{amt\}/g, 'BDT {amt}');
  
  // Replace negative/positive prefixes
  content = content.replace(/-\$\{/g, '-BDT {'); // but previous replace might have already hit this if it was -${requiredAmount
  content = content.replace(/\+BDT/g, '+ BDT');
  content = content.replace(/-BDT/g, '- BDT');
  
  content = content.replace(/\$100,000/g, 'BDT 100,000');
  content = content.replace(/\$100/g, 'BDT 100');
  content = content.replace(/placeholder="\$0\.00"/g, 'placeholder="BDT 0.00"');
  
  // Fix the literal `+${amt}` which became `+ BDT {amt}` above, wait...
  content = content.replace(/\+\$\{amt\}/g, '+ BDT {amt}'); // This will be handled if not replaced yet.

  // Re-fix the ternary operator formatting `{isRecharge ? '+' : '-'}$`
  content = content.replace(/'\+' : '-'\}\$/g, "'+' : '-'} BDT ");

  fs.writeFileSync(filePath, content, 'utf8');
}

replaceCurrency('client/src/pages/Dashboard.jsx');
replaceCurrency('client/src/pages/Transactions.jsx');
replaceCurrency('server/src/controllers/rechargeController.js');

console.log('Currency replaced successfully');
