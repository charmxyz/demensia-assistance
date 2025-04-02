import React from 'react';

interface FaganNomogramProps {
  preTestProbability: number;
  likelihoodRatio: number;
  postTestProbability: number;
}

const FaganNomogram: React.FC<FaganNomogramProps> = ({
  preTestProbability,
  likelihoodRatio,
  postTestProbability,
}) => {
  // Convert probabilities to log odds
  const preTestOdds = Math.log(preTestProbability / (100 - preTestProbability));
  const postTestOdds = Math.log(postTestProbability / (100 - postTestProbability));
  const logLR = Math.log(likelihoodRatio);

  // Scale factors for visualization
  const scale = 100; // Reduced from 200 to 100 to fit better
  const offset = 150; // Increased from 100 to 150 to provide more space

  // Calculate positions
  const preTestY = offset - preTestOdds * scale;
  const postTestY = offset - postTestOdds * scale;
  const lrY = offset - logLR * scale;

  return (
    <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Fagan Nomogram</h3>
      <div className="relative h-[400px] w-full max-w-md mx-auto overflow-hidden">
        {/* Left axis (Pre-test probability) */}
        <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-gray-300">
          {[1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99].map((prob) => {
            const y = offset - Math.log(prob / (100 - prob)) * scale;
            return (
              <div
                key={prob}
                className="absolute text-xs text-gray-600"
                style={{ top: `${y}px`, left: '4px' }}
              >
                {prob}%
              </div>
            );
          })}
        </div>

        {/* Right axis (Post-test probability) */}
        <div className="absolute right-0 top-0 bottom-0 w-8 border-l border-gray-300">
          {[1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99].map((prob) => {
            const y = offset - Math.log(prob / (100 - prob)) * scale;
            return (
              <div
                key={prob}
                className="absolute text-xs text-gray-600"
                style={{ top: `${y}px`, right: '4px' }}
              >
                {prob}%
              </div>
            );
          })}
        </div>

        {/* Middle axis (Likelihood Ratio) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-8 -ml-4">
          {[0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100].map((lr) => {
            const y = offset - Math.log(lr) * scale;
            return (
              <div
                key={lr}
                className="absolute text-xs text-gray-600"
                style={{ top: `${y}px`, left: '50%', transform: 'translateX(-50%)' }}
              >
                {lr}
              </div>
            );
          })}
        </div>

        {/* Lines */}
        <div className="absolute left-8 right-8 top-0 bottom-0">
          {/* Pre-test to LR line */}
          <div
            className="absolute w-full border-t-2 border-blue-500"
            style={{ top: `${preTestY}px` }}
          />
          
          {/* LR to Post-test line */}
          <div
            className="absolute w-full border-t-2 border-green-500"
            style={{ top: `${postTestY}px` }}
          />
          
          {/* Vertical line at LR */}
          <div
            className="absolute h-full border-l-2 border-dashed border-gray-400"
            style={{ left: '50%' }}
          />
        </div>

        {/* Points */}
        <div
          className="absolute w-3 h-3 rounded-full bg-blue-500"
          style={{ left: '8px', top: `${preTestY - 6}px` }}
        />
        <div
          className="absolute w-3 h-3 rounded-full bg-green-500"
          style={{ right: '8px', top: `${postTestY - 6}px` }}
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Pre-test probability: {preTestProbability.toFixed(1)}%</p>
        <p>Likelihood Ratio: {likelihoodRatio.toFixed(1)}</p>
        <p>Post-test probability: {postTestProbability.toFixed(1)}%</p>
      </div>
    </div>
  );
};

export default FaganNomogram; 