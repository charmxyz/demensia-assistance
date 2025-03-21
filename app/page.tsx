'use client';

import { useState } from 'react';

interface TestOption {
  name: string;
  threshold: number;
  lrPositive: number;
  lrNegative: number;
}

const TEST_OPTIONS: TestOption[] = [
  {
    name: 'Neurofilament Light (NfL)',
    threshold: 20,
    lrPositive: 2.5,
    lrNegative: 0.5,
  },
  {
    name: 'Glial Fibrillary Acidic Protein (GFAP)',
    threshold: 15,
    lrPositive: 5,
    lrNegative: 0.1,
  },
  {
    name: 'Phosphorylated Tau 217 (pTau 217)',
    threshold: 10,
    lrPositive: 9.3,
    lrNegative: 0.46,
  },
  {
    name: 'Amyloid PET Scan',
    threshold: 5,
    lrPositive: 30.7,
    lrNegative: 0.08,
  },
];

interface CalculationDetails {
  doctorProbability: number;
  baselineProbability: number;
  adjustedProbability: number;
  positivePostTestProbability: number;
  negativePostTestProbability: number;
  positiveChange: number;
  negativeChange: number;
  testThreshold: number;
  likelihoodRatios: {
    positive: number;
    negative: number;
  };
}

export default function DementiaRiskCalculator() {
  const [doctorProbability, setDoctorProbability] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [calculationDetails, setCalculationDetails] = useState<CalculationDetails | null>(null);

  const getBaselineProbability = (age: number): number => {
    if (age < 60) return 3;
    if (age <= 65) return 10;
    if (age <= 70) return 15;
    if (age <= 75) return 25;
    if (age <= 80) return 35;
    if (age <= 85) return 50;
    return 65;
  };

  const calculatePostTestProbability = (
    preTestProbability: number,
    likelihoodRatio: number
  ): number => {
    const preTestOdds = preTestProbability / (1 - preTestProbability);
    const postTestOdds = preTestOdds * likelihoodRatio;
    return postTestOdds / (1 + postTestOdds);
  };

  const calculateRisk = () => {
    const age = parseInt(patientAge);
    const doctorProb = parseFloat(doctorProbability) / 100;

    if (isNaN(age) || isNaN(doctorProb) || !selectedTest) {
      setResult('Please fill in all fields with valid values.');
      return;
    }

    const baselineProb = getBaselineProbability(age) / 100;
    const preTestProb = Math.max(doctorProb, baselineProb);

    const selectedTestOption = TEST_OPTIONS.find(
      (test) => test.name === selectedTest
    );

    if (!selectedTestOption) {
      setResult('Please select a valid test.');
      return;
    }

    const positivePostTestProb = calculatePostTestProbability(
      preTestProb,
      selectedTestOption.lrPositive
    );
    const negativePostTestProb = calculatePostTestProbability(
      preTestProb,
      selectedTestOption.lrNegative
    );

    const positiveChange = (positivePostTestProb - preTestProb) * 100;
    const negativeChange = (negativePostTestProb - preTestProb) * 100;

    setCalculationDetails({
      doctorProbability: doctorProb * 100,
      baselineProbability: baselineProb * 100,
      adjustedProbability: preTestProb * 100,
      positivePostTestProbability: positivePostTestProb * 100,
      negativePostTestProbability: negativePostTestProb * 100,
      positiveChange,
      negativeChange,
      testThreshold: selectedTestOption.threshold,
      likelihoodRatios: {
        positive: selectedTestOption.lrPositive,
        negative: selectedTestOption.lrNegative,
      },
    });

    if (preTestProb * 100 < selectedTestOption.threshold) {
      setResult(
        `${selectedTestOption.name} could provide additional information but is not strongly recommended.`
      );
    } else if (Math.abs(positiveChange) > 30 || Math.abs(negativeChange) > 30) {
      setResult(
        `${selectedTestOption.name} is recommended as it could significantly impact the diagnosis.`
      );
    } else {
      setResult(
        `${selectedTestOption.name} could provide additional information but is not strongly recommended.`
      );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold text-primary-900 mb-8 text-center">
            Dementia Risk Calculator
          </h1>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="doctorProbability" className="block text-sm font-semibold text-gray-700 mb-2">
                Doctor's Estimated Dementia Probability (%)
              </label>
              <input
                type="number"
                id="doctorProbability"
                value={doctorProbability}
                onChange={(e) => setDoctorProbability(e.target.value)}
                className="input-field text-black placeholder-gray-500"
                placeholder="Enter probability percentage"
              />
            </div>

            <div>
              <label htmlFor="patientAge" className="block text-sm font-semibold text-gray-700 mb-2">
                Patient's Age
              </label>
              <input
                type="number"
                id="patientAge"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="input-field text-black placeholder-gray-500"
                placeholder="Enter patient age"
              />
            </div>

            <div>
              <label htmlFor="testSelection" className="block text-sm font-semibold text-gray-700 mb-2">
                Select Diagnostic Test
              </label>
              <select
                id="testSelection"
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="input-field text-black"
              >
                <option value="">Select a test</option>
                {TEST_OPTIONS.map((test) => (
                  <option key={test.name} value={test.name}>
                    {test.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={calculateRisk}
              className="btn-primary"
            >
              Calculate Risk
            </button>

            {result && (
              <div className="mt-6 space-y-4">
                <h2 className="text-xl font-semibold text-primary-900">Recommendation</h2>
                <div className={`p-4 rounded-lg border ${
                  result.includes('not strongly recommended')
                    ? 'bg-red-50 border-red-200'
                    : 'bg-primary-50 border-primary-200'
                }`}>
                  <p className={`font-medium ${
                    result.includes('not strongly recommended')
                      ? 'text-red-900'
                      : 'text-primary-900'
                  }`}>{result}</p>
                </div>
                
                {calculationDetails && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Calculation Details</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Initial Probabilities</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                          <div>Doctor's Estimate:</div>
                          <div>{calculationDetails.doctorProbability.toFixed(1)}%</div>
                          <div>Baseline (Age-based):</div>
                          <div>{calculationDetails.baselineProbability.toFixed(1)}%</div>
                          <div>Adjusted Pre-test:</div>
                          <div>{calculationDetails.adjustedProbability.toFixed(1)}%</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Test Parameters</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                          <div>Test Threshold:</div>
                          <div>{calculationDetails.testThreshold}%</div>
                          <div>LR+:</div>
                          <div>{calculationDetails.likelihoodRatios.positive.toFixed(1)}</div>
                          <div>LR-:</div>
                          <div>{calculationDetails.likelihoodRatios.negative.toFixed(1)}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Post-Test Probabilities</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                          <div>Positive Result:</div>
                          <div>{calculationDetails.positivePostTestProbability.toFixed(1)}%</div>
                          <div>Negative Result:</div>
                          <div>{calculationDetails.negativePostTestProbability.toFixed(1)}%</div>
                          <div>Positive Change:</div>
                          <div className={calculationDetails.positiveChange > 0 ? 'text-green-600' : 'text-red-600'}>
                            {calculationDetails.positiveChange > 0 ? '+' : ''}{calculationDetails.positiveChange.toFixed(1)}%
                          </div>
                          <div>Negative Change:</div>
                          <div className={calculationDetails.negativeChange > 0 ? 'text-green-600' : 'text-red-600'}>
                            {calculationDetails.negativeChange > 0 ? '+' : ''}{calculationDetails.negativeChange.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 