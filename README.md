# Dementia Risk Calculator

A web application designed to help clinicians assess whether a dementia test is recommended based on various factors including patient age, doctor's estimated probability, and selected diagnostic tests.

## Features

- **Input Parameters**:
  - Doctor's Estimated Dementia Probability (%)
  - Patient's Age
  - Diagnostic Test Selection

- **Available Diagnostic Tests**:
  - Neurofilament Light (NfL)
  - Glial Fibrillary Acidic Protein (GFAP)
  - Phosphorylated Tau 217 (pTau 217)
  - Amyloid PET Scan

- **Calculation Logic**:
  - Age-based baseline probability adjustment
  - Test-specific likelihood ratios
  - Post-test probability calculations
  - Threshold-based recommendations

- **Visual Feedback**:
  - Color-coded recommendations (blue for recommended, red for not recommended)
  - Detailed calculation breakdown
  - Clear probability changes

## Tech Stack

- **Framework**: Next.js 14.1.0
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Railway.app (recommended)

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd dementia-risk-calculator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Calculation Details

The calculator provides detailed information including:
- Initial probabilities (Doctor's estimate, Baseline, Adjusted)
- Test parameters (Threshold, Likelihood ratios)
- Post-test probabilities and changes

## Deployment

The application is optimized for deployment on Railway.app:
1. Push your code to GitHub
2. Connect your repository to Railway
3. Railway will automatically detect and deploy the Next.js application

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details. 