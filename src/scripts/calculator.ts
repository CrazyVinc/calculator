let currentInput = "";
let previousInput = "";
let operator = "";

const result = document.getElementById("result") as HTMLDivElement;
const numberButtons = document.querySelectorAll<HTMLElement>("[data-button]");
const historyContainer = document.getElementById("history") as HTMLDivElement;
const buttonDivs = document.querySelectorAll<HTMLElement>(".bg-gray-600");

document.addEventListener("astro:page-load", () => {
    numberButtons.forEach(button => button.addEventListener("click", handleButtonClick));
});

document.addEventListener("keydown", handleButtonClick);

function handleButtonClick(ev: KeyboardEvent | MouseEvent) {
    let value: string;

    if ('key' in ev) value = ev.key;
    else value = (ev.target as HTMLElement).dataset.button || '';

    if (["CLEAR", "OFF"].includes(value)) {
        handleClearOrOff(value);
    } else if (value === "=" || value == "Enter") {
        handleEqual();
    } else if (["+", "-", "*", "/"].includes(value)) {
        handleOperator(value);
        
    } else if (value == "Backspace") {
        if (currentInput === "") return operator = "";
        currentInput = currentInput.slice(0, -1);
    } else {
        if (!isValidNumberInput(value)) return;
        handleNumberInput(value);
    }

    updateDisplay();
}

function isValidNumberInput(value: string): boolean {
    return /^\d*\.?\d*%?$/.test(currentInput + value);
}

function handleClearOrOff(value: string) {
    currentInput = previousInput = operator = "";
    result.textContent = value === "OFF" ? "Calculator Off" : "";
}

function createHistoryNode(text: string) {
    const span = document.createElement("span");
    span.innerText = text;
    return span;
}

function handleEqual() {
    if (currentInput && previousInput) {
        let displayText = `${previousInput} ${operator} ${currentInput}`;
        let resultValue: number;

        if (currentInput.endsWith("%")) {
            const percentageValue = parseFloat(currentInput.slice(0, -1));
            const percentageAmount = (percentageValue / 100) * parseFloat(previousInput);

            if (operator === "-") {
                resultValue = parseFloat(previousInput) - percentageAmount;
                displayText = `${previousInput} - ${percentageValue}% = ${resultValue.toString()}`;
            } else if (operator === "+") {
                resultValue = parseFloat(previousInput) + percentageAmount;
                displayText = `${previousInput} + ${percentageValue}% = ${resultValue.toString()}`;
            }
        } else {
            resultValue = calculate(previousInput, currentInput, operator);
            displayText += ` = ${resultValue.toString()}`;
        }

        const display = createHistoryNode(displayText);
        historyContainer.appendChild(document.createElement("br"));
        historyContainer.appendChild(display);

        currentInput = resultValue.toString();
        operator = previousInput = "";
    }
}

function handleOperator(value: string) {
    operator = value;
    if (currentInput) previousInput = currentInput;
    currentInput = "";
}

function handleNumberInput(value: string) {
    currentInput += value;
}

function updateDisplay() {
    result.textContent = `${previousInput}${operator}${currentInput}` || "0";
}

function calculate(a: string, b: string, op: string): number {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    switch (op) {
        case "+": return numA + numB;
        case "-": return numA - numB;
        case "*": return numA * numB;
        case "/": return numA / numB;
        default: return numB;
    }
}
updateDisplay();

// Styling logic
document.getElementById("style")!.addEventListener("input", updateColorScheme);

function updateColorScheme(e: Event) {
    const colorValue = (e.target as HTMLInputElement).value;
    const calculator = document.getElementById("calculator")!;

    calculator.style.backgroundColor = colorValue;
    result.style.backgroundColor = adjustBrightness(colorValue, -5);
    const isDark = isDarkTheme(colorValue);
    updateButtonStyles(colorValue, isDark);
}

function updateButtonStyles(colorValue: string, isDark: boolean) {
    const buttonBackground = isDark ? "#444" : "#ddd";
    const buttonTextColor = isDark ? "#eee" : "#000";

    buttonDivs.forEach(div => {
        div.style.backgroundColor = adjustBrightness(colorValue, isDark ? 5 : -5);
    });
    numberButtons.forEach(button => {
        button.style.backgroundColor = buttonBackground;
        button.style.color = buttonTextColor;
    });
}

function isDarkTheme(color: string): boolean {
    const [r, g, b] = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16)];
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
}

function adjustBrightness(hex: string, percent: number): string {
    const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + (parseInt(hex.slice(1, 3), 16) * percent) / 100));
    const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + (parseInt(hex.slice(3, 5), 16) * percent) / 100));
    const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + (parseInt(hex.slice(5, 7), 16) * percent) / 100));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
