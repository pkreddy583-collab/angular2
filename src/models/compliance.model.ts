export interface EmailLog {
  id: number;
  timestamp: Date;
  portfolioId: string;
  portfolioName: string;
  type: 'EOD' | 'BOD';
  recipients: string;
  subject: string;
  status: 'On Time' | 'Late' | 'Missed';
}
