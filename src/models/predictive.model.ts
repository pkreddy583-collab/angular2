export interface PredictiveModel {
  id: string;
  name: string;
  description: string;
  inputLabel: string;
  inputOptions: string[];
}

export interface PredictionResult {
  prediction: string;
  confidence: 'High' | 'Medium' | 'Low';
  keyFactors: string[];
  recommendations: string[];
}
