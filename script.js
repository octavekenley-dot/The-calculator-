const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");

let expression = "";
let justEvaluated = false;

function updateDisplay() {
  display.textContent = expression || "0";
}

function sanitizeExpression(value) {
  const cleaned = value.replace(/×/g, "*").replace(/÷/g, "/");
  return cleaned;
}

function calculatePercent(value) {
  return Number(value) / 100;
}

function evaluateExpression(expr) {
  const safeExpr = sanitizeExpression(expr);

  if (!safeExpr || !/[\d.()+\-*/%]/.test(safeExpr)) {
    return "Erreur";
  }

  try {
    const normalized = safeExpr.replace(/%/g, "/100");
    // Sécurité minimale : on autorise uniquement les caractères mathématiques
    const validChars = /^[0-9+\-*/().% ]+$/;
    if (!validChars.test(normalized)) {
      return "Erreur";
    }

    const result = Function(`"use strict"; return (${normalized});`)();

    if (!Number.isFinite(result)) {
      return "Erreur";
    }

    return Number.isInteger(result) ? String(result) : String(parseFloat(result.toFixed(10)));
  } catch {
    return "Erreur";
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;

    if (value === "C") {
      expression = "";
      justEvaluated = false;
      updateDisplay();
      return;
    }

    if (value === "DEL") {
      expression = expression.slice(0, -1);
      updateDisplay();
      return;
    }

    if (value === "=") {
      const result = evaluateExpression(expression);

      if (result === "Erreur") {
        expression = "";
      } else {
        expression = result;
      }

      justEvaluated = true;
      updateDisplay();
      return;
    }

    if (value === "%") {
      if (!expression) return;

      const lastNumber = expression.match(/(\d+(\.\d+)?)$/);
      if (!lastNumber) return;

      const number = lastNumber[1];
      const before = expression.slice(0, -number.length);
      expression = `${before}${number}/100`;
      updateDisplay();
      return;
    }

    if (justEvaluated && /[0-9.]/.test(value)) {
      expression = "";
      justEvaluated = false;
    }

    if (value === "." && /[0-9]$/.test(expression) === false && !expression) {
      expression += "0.";
      updateDisplay();
      return;
    }

    if (value === "." && /[0-9]$/.test(expression) === false && expression !== "") {
      const lastChar = expression.slice(-1);
      if (/[+\-*/]/.test(lastChar)) {
        expression += "0.";
      }
      updateDisplay();
      return;
    }

    if (/[+\-*/]/.test(value)) {
      if (!expression) return;

      const lastChar = expression.slice(-1);
      if (/[+\-*/]/.test(lastChar)) {
        expression = expression.slice(0, -1) + value;
      } else {
        expression += value;
      }

      updateDisplay();
      return;
    }

    if (value === "." && expression.includes(".")) {
      const lastOperatorIndex = Math.max(
        expression.lastIndexOf("+"),
        expression.lastIndexOf("-"),
        expression.lastIndexOf("*"),
        expression.lastIndexOf("/")
      );

      const currentNumber = expression.slice(lastOperatorIndex + 1);
      if (currentNumber.includes(".")) {
        return;
      }
    }

    expression += value;
    updateDisplay();
  });
});

updateDisplay();