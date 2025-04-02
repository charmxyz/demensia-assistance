'use client';

import { useState } from 'react';
import FaganNomogram from './components/FaganNomogram';

interface TestOption {
  name: string;
  threshold: number;
  lrPositive: number;
  lrNegative: number;
  source: string;
  sourceLink?: string;  // Optional link to the source
}

const TEST_OPTIONS: TestOption[] = [
  {
    name: 'Plasma ptau217',
    threshold: 10,
    lrPositive: 20.9,
    lrNegative: 0.07,
    source: "Palmqvist S, et al. (2020) - JAMA",
    sourceLink: "https://jamanetwork.com/journals/jama/fullarticle/2768841"
  },
  {
    name: 'CSF AB 42:40 ratio',
    threshold: 10,
    lrPositive: 8.07,
    lrNegative: 0.049,
    source: "Based on performance relative to amyloid PET positivity, Baldeiras I, et al. (2018) - Alzheimer's Research & Therapy",
    sourceLink: "https://doi.org/10.1186/s13195-018-0362-2"
  },
  // {
  //   name: 'Amyloid PET Scan',
  //   threshold: 5,
  //   lrPositive: 30.7,
  //   lrNegative: 0.08,
  //   source: "Source: Rabinovici et al. (2019) - JAMA",
  // },
  // {
  //   name: 'Neurofilament Light (NfL)',
  //   threshold: 20,
  //   lrPositive: 2.5,
  //   lrNegative: 0.5,
  //   source: "Source: Ashton et al. (2021) - Neurology",
  // },
  // {
  //   name: 'Glial Fibrillary Acidic Protein (GFAP)',
  //   threshold: 15,
  //   lrPositive: 5,
  //   lrNegative: 0.1,
  //   source: "Source: Oeckl et al. (2022) - Nature Medicine",
  // },
  // CSF AB 42:40 ratio based on average from multiple studies:
  // - Baldeiras et al. (2018) - Alz Res Therapy: LR+ = 7.5, LR- = 0.2
  // - Hansson et al. (2018) - JAMA Neurology: LR+ = 8.07, LR- = 0.049
  // - Additional studies show similar ranges
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
  const [step, setStep] = useState<number>(1);
  const [doctorProbability, setDoctorProbability] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [calculationDetails, setCalculationDetails] = useState<CalculationDetails | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [customLR, setCustomLR] = useState<{ positive: string; negative: string; source: string }>({
    positive: '',
    negative: '',
    source: ''
  });

  const getBaselineProbability = (age: number): number => {
    if (age < 60) return 3;
    if (age <= 65) return 10;
    if (age <= 70) return 15;
    if (age <= 75) return 25;
    if (age <= 80) return 35;
    if (age <= 85) return 50;
    return 65;
  };

  const handleAgeSubmit = () => {
    if (patientAge && !isNaN(parseInt(patientAge))) {
      const age = parseInt(patientAge);
      const baselineProb = getBaselineProbability(age);
      setDoctorProbability(baselineProb.toString());
      setStep(2);
    }
  };

  const handleProbabilitySubmit = () => {
    if (doctorProbability && !isNaN(parseFloat(doctorProbability))) {
      setStep(3);
    }
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

  const handleEdit = (field: string) => {
    setEditing(field);
  };

  const handleEditSubmit = () => {
    setEditing(null);
    calculateRisk();
  };

  const startAgain = () => {
    setStep(1);
    setPatientAge('');
    setDoctorProbability('');
    setSelectedTest('');
    setResult('');
    setCalculationDetails(null);
    setEditing(null);
  };

  const handleEditLR = (field: 'positive' | 'negative', value: string) => {
    if (value && !isNaN(parseFloat(value))) {
      const selectedTestOption = TEST_OPTIONS.find(test => test.name === selectedTest);
      if (selectedTestOption) {
        if (field === 'positive') {
          selectedTestOption.lrPositive = parseFloat(value);
        } else {
          selectedTestOption.lrNegative = parseFloat(value);
        }
        selectedTestOption.source = "User input manually";
        calculateRisk();
      }
    }
    setEditing(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold text-primary-900 mb-4 text-center">
            Alzheimer's Disease Risk Calculator
          </h1>
          
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important Notice:</strong> This tool is intended to help indicate whether biomarkers for Alzheimer's disease would be clinically helpful. It is designed for educational purposes only and is not approved for clinical use in patients. The results should not be used to make clinical decisions.
            </p>
          </div>

          {!result && (
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <div className={`text-sm ${step >= 1 ? 'text-primary-900' : 'text-gray-400'}`}>Age</div>
                <div className={`text-sm ${step >= 2 ? 'text-primary-900' : 'text-gray-400'}`}>Adjusted Risk</div>
                <div className={`text-sm ${step >= 3 ? 'text-primary-900' : 'text-gray-400'}`}>Choose Test</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {result && (
            <div className="mb-8 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-primary-900">Input Summary</h2>
                <button
                  onClick={startAgain}
                  className="text-blue-600 underline text-sm hover:text-blue-800"
                >
                  Start Again
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-black">
                    <span className="font-medium">Age:</span> {patientAge}
                  </div>
                  <button
                    onClick={() => handleEdit('age')}
                    className="text-blue-600 underline text-sm hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-black">
                    <span className="font-medium">Adjusted risk probability based on Doctor's Clinical Assessment:</span> {doctorProbability}%
                  </div>
                  <button
                    onClick={() => handleEdit('probability')}
                    className="text-blue-600 underline text-sm hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-black">
                    <span className="font-medium">Choose test:</span> {selectedTest}
                  </div>
                  <button
                    onClick={() => handleEdit('test')}
                    className="text-blue-600 underline text-sm hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {editing === 'age' && (
            <div className="space-y-4">
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
              <button
                onClick={handleEditSubmit}
                className="btn-primary w-full"
              >
                Update
              </button>
            </div>
          )}

          {editing === 'probability' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="doctorProbability" className="block text-sm font-semibold text-gray-700 mb-2">
                  Adjust your clinical assessment of Alzheimer's disease probability (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    id="doctorProbability"
                    min="0"
                    max="100"
                    value={doctorProbability}
                    onChange={(e) => setDoctorProbability(e.target.value)}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="w-16 text-center text-lg font-medium text-gray-900">
                    {doctorProbability}%
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{getBaselineProbability(parseInt(patientAge))}% (Population Risk)</span>
                </div>
              </div>
              <button
                onClick={handleEditSubmit}
                className="btn-primary w-full"
              >
                Update
              </button>
            </div>
          )}

          {editing === 'test' && (
            <div className="space-y-4">
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
                onClick={handleEditSubmit}
                className="btn-primary w-full"
              >
                Update
              </button>
            </div>
          )}

          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
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
                <button
                  onClick={handleAgeSubmit}
                  className="btn-primary w-full"
                >
                  Next
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">
                    Based on population data, the risk of Alzheimer's disease for a {patientAge}-year-old is {getBaselineProbability(parseInt(patientAge))}%.
                    Based on your clinical impression, what do you think of this? Please adjust the value up or down based on:
                  </p>
                  <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Family history of dementia</li>
                    <li>Presence of memory complaints</li>
                    <li>Performance on cognitive screening</li>
                    <li>Other risk factors or protective factors</li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-500 italic">
                    Note: This assessment is for educational purposes only and should not be used for clinical decision-making.
                  </p>
                </div>
                <div>
                  <label htmlFor="doctorProbability" className="block text-sm font-semibold text-gray-700 mb-2">
                    Adjust your clinical assessment of Alzheimer's disease probability (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      id="doctorProbability"
                      min="0"
                      max="100"
                      value={doctorProbability}
                      onChange={(e) => setDoctorProbability(e.target.value)}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="w-16 text-center text-lg font-medium text-gray-900">
                      {doctorProbability}%
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{getBaselineProbability(parseInt(patientAge))}% (Population Risk)</span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-secondary text-[#D4D4D4] flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleProbabilitySubmit}
                    className="btn-primary flex-1"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 3 && !result && (
              <div className="space-y-4">
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
                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-secondary text-[#D4D4D4] flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={calculateRisk}
                    className="btn-primary flex-1"
                  >
                    Calculate Risk
                  </button>
                </div>
              </div>
            )}

            {result && (
              <div className="mt-6 space-y-4">
                <h2 className="text-xl font-semibold text-primary-900">What might this test tell me?</h2>
                <div className="p-4 rounded-lg border bg-primary-50 border-primary-200">
                  <div className="space-y-3">
                    <p className="font-medium text-primary-900">
                      {calculationDetails && (
                        <>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold text-primary-900 mb-2">Alzheimer's disease probability</h3>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-sm text-gray-600">If test is positive:</p>
                                  <p className="text-2xl font-bold text-green-600">
                                    {calculationDetails.positivePostTestProbability.toFixed(1)}%
                                  </p>
                                  <p className="mt-2 text-xs text-gray-500 italic">
                                    {calculationDetails.positivePostTestProbability > 95 
                                      ? "This result is sufficient to confidently confirm Alzheimer's disease (using threshold of 95%)"
                                      : "This result is not sufficient to confidently confirm Alzheimer's disease (using threshold of 95%)"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">If test is negative:</p>
                                  <p className="text-2xl font-bold text-red-600">
                                    {calculationDetails.negativePostTestProbability.toFixed(1)}%
                                  </p>
                                  <p className="mt-2 text-xs text-gray-500 italic">
                                    {calculationDetails.negativePostTestProbability < 1.5 
                                      ? "This result is sufficient to confidently rule out Alzheimer's disease (using threshold of 1.5%)"
                                      : "This result is not sufficient to confidently rule out Alzheimer's disease (using threshold of 1.5%)"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                
                {calculationDetails && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Calculation Details</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Test Information</h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-700">Positive Test Strength (LR+)</div>
                              <div className="flex items-center gap-2">
                                <div className="text-lg font-medium text-gray-900">{calculationDetails.likelihoodRatios.positive.toFixed(2)}</div>
                                <button
                                  onClick={() => setEditing('positive')}
                                  className="text-blue-600 underline text-sm hover:text-blue-800"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                            {editing === 'positive' && (
                              <div className="mt-2 flex items-center gap-2">
                                <input
                                  type="number"
                                  value={customLR.positive}
                                  onChange={(e) => setCustomLR(prev => ({ ...prev, positive: e.target.value }))}
                                  className="input-field text-black flex-1"
                                  placeholder="Enter LR+ value"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditing(null)}
                                    className="text-[#D4D4D4] text-sm hover:text-gray-600"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleEditLR('positive', customLR.positive)}
                                    className="btn-primary text-sm"
                                  >
                                    Update
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-700">Negative Test Strength (LR-)</div>
                              <div className="flex items-center gap-2">
                                <div className="text-lg font-medium text-gray-900">{calculationDetails.likelihoodRatios.negative.toFixed(2)}</div>
                                <button
                                  onClick={() => setEditing('negative')}
                                  className="text-blue-600 underline text-sm hover:text-blue-800"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                            {editing === 'negative' && (
                              <div className="mt-2 flex items-center gap-2">
                                <input
                                  type="number"
                                  value={customLR.negative}
                                  onChange={(e) => setCustomLR(prev => ({ ...prev, negative: e.target.value }))}
                                  className="input-field text-black flex-1"
                                  placeholder="Enter LR- value"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditing(null)}
                                    className="text-[#D4D4D4] text-sm hover:text-gray-600"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleEditLR('negative', customLR.negative)}
                                    className="btn-primary text-sm"
                                  >
                                    Update
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-700">Source</div>
                            <div className="flex justify-between items-center">
                              <div className="text-sm italic text-gray-900">{TEST_OPTIONS.find(test => test.name === selectedTest)?.source}</div>
                              {TEST_OPTIONS.find(test => test.name === selectedTest)?.sourceLink && !editing && (
                                <a
                                  href={TEST_OPTIONS.find(test => test.name === selectedTest)?.sourceLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline text-sm hover:text-blue-800"
                                >
                                  Visit
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Post-Test Probabilities</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                          <div>If Test is Positive:</div>
                          <div>{calculationDetails.positivePostTestProbability.toFixed(1)}%</div>
                          <div>If Test is Negative:</div>
                          <div>{calculationDetails.negativePostTestProbability.toFixed(1)}%</div>
                          <div>Change if Positive:</div>
                          <div className={calculationDetails.positiveChange > 0 ? 'text-green-600' : 'text-red-600'}>
                            {calculationDetails.positiveChange > 0 ? '+' : ''}{calculationDetails.positiveChange.toFixed(1)}%
                          </div>
                          <div>Change if Negative:</div>
                          <div className={calculationDetails.negativeChange > 0 ? 'text-green-600' : 'text-red-600'}>
                            {calculationDetails.negativeChange > 0 ? '+' : ''}{calculationDetails.negativeChange.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">How We Calculate the Results</h4>
                        <div className="text-sm text-gray-700 space-y-2">
                          <p>1. We start with the pre-test probability: {calculationDetails.adjustedProbability.toFixed(1)}%</p>
                          <p>2. Convert to odds: {calculationDetails.adjustedProbability.toFixed(1)}% / (1 - {calculationDetails.adjustedProbability.toFixed(1)}%)</p>
                          <p>3. Multiply by the test's likelihood ratio: × {calculationDetails.likelihoodRatios.positive.toFixed(2)}</p>
                          <p>4. Convert back to probability: odds / (1 + odds)</p>
                          <p className="mt-2">This gives us the final probability of {calculationDetails.positivePostTestProbability.toFixed(1)}% if the test is positive.</p>
                        </div>
                      </div>

                      {/* Add Fagan Nomogram */}
                      <FaganNomogram
                        preTestProbability={calculationDetails.adjustedProbability}
                        likelihoodRatio={calculationDetails.likelihoodRatios.positive}
                        postTestProbability={calculationDetails.positivePostTestProbability}
                      />
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