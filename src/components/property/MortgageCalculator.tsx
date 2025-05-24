import { useState } from 'react';
import { Calculator } from 'lucide-react';

interface MortgageCalculatorProps {
  propertyPrice: number;
  currency: string;
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ propertyPrice, currency }) => {
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(3.5);
  const [loanTerm, setLoanTerm] = useState(30);

  const calculateMortgage = () => {
    const principal = propertyPrice * (1 - downPayment / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return monthlyPayment;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency === 'UF' ? 'CLF' : 'CLP',
      minimumFractionDigits: currency === 'UF' ? 2 : 0,
    }).format(amount);
  };

  const monthlyPayment = calculateMortgage();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Calculator className="w-6 h-6 text-amber-500 mr-2" />
        <h3 className="text-xl font-semibold">Calculadora Hipotecaria</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio de la propiedad
          </label>
          <input
            type="text"
            value={formatCurrency(propertyPrice)}
            disabled
            className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pie (%)
          </label>
          <input
            type="range"
            min="10"
            max="50"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{downPayment}%</span>
            <span>{formatCurrency(propertyPrice * (downPayment / 100))}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tasa de interés anual (%)
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            step="0.1"
            min="1"
            max="15"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plazo del crédito (años)
          </label>
          <select
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value={15}>15 años</option>
            <option value={20}>20 años</option>
            <option value={25}>25 años</option>
            <option value={30}>30 años</option>
          </select>
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">Pago mensual estimado:</p>
          <p className="text-2xl font-bold text-amber-600">
            {formatCurrency(monthlyPayment)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            *Este es un cálculo aproximado. Consulte con su banco para obtener una cotización precisa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;