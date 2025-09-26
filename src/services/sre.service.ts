import { Injectable, signal } from '@angular/core';
import { WebApp, MetricDataPoint, SreInvestigation, LogEntry, SSLCertificate } from '../models/sre.model';

// Helper function to generate time-series metric data
const generateMetricData = (
  points: number,
  min: number,
  max: number,
  trend: 'up' | 'down' | 'stable' = 'stable',
  spikeAt?: number
): MetricDataPoint[] => {
  const data: MetricDataPoint[] = [];
  const now = Date.now();
  for (let i = 0; i < points; i++) {
    let value = Math.random() * (max - min) + min;
    if (trend === 'up') value *= 1 + i / (points * 2);
    if (trend === 'down') value *= 1 - i / (points * 2);
    if (spikeAt && i > spikeAt) {
        value *= 2; // Simulate a spike
    }
    data.push({
      timestamp: now - (points - i) * 60000, // One point per minute
      value: Math.max(min, Math.min(max, value)),
    });
  }
  return data;
};

const now = new Date();
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

const generateLogs = (appName: string, errorRate: number): LogEntry[] => {
    const logs: LogEntry[] = [];
    const services = ['auth-service', 'user-profile-service', 'payment-proxy'];
    const messages = {
      INFO: ['User logged in successfully', 'Request processed in 25ms', 'Data fetched from cache'],
      WARN: ['Cache miss for user_session:123', 'Upstream service responding slowly'],
      ERROR: ['Database connection timed out', 'Null pointer exception at UserProfile:88', 'Failed to process payment: Invalid API Key']
    };
    for(let i=0; i < 200; i++) {
        const random = Math.random() * 100;
        let level: 'INFO' | 'WARN' | 'ERROR' = 'INFO';
        if (random < errorRate * 2) {
            level = 'ERROR';
        } else if (random < errorRate * 4) {
            level = 'WARN';
        }
        logs.push({
            timestamp: new Date(now.getTime() - (200 - i) * 15000), // 15 seconds apart
            level: level,
            message: messages[level][Math.floor(Math.random() * messages[level].length)],
            service: services[Math.floor(Math.random() * services.length)]
        });
    }
    return logs.sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());
}

const initialWebApps: WebApp[] = [
    {
        id: 'app-enrollment-hub',
        name: 'Enrollment Hub',
        healthStatus: 'Warning',
        apdex: 0.88,
        errorRate: 1.8,
        p95Latency: 1850,
        cpuUtilization: 75,
        memUtilization: 68,
        metrics: {
            latency: generateMetricData(30, 800, 1200, 'up', 25),
            errorRate: generateMetricData(30, 0.5, 1.5, 'up'),
            cpu: generateMetricData(30, 40, 60),
            memory: generateMetricData(30, 60, 70)
        },
        certificates: [
            { domain: 'enroll.example.com', issuer: 'Let\'s Encrypt', expiryDate: addDays(now, 85), daysUntilExpiry: 85, status: 'Valid' },
            { domain: 'api.enroll.example.com', issuer: 'DigiCert', expiryDate: addDays(now, 25), daysUntilExpiry: 25, status: 'Expires Soon' },
        ],
        deployments: [
            { id: 5021, timestamp: new Date(now.getTime() - 15 * 60000), author: 'B. Smith', status: 'Success' },
            { id: 5020, timestamp: new Date(now.getTime() - 4 * 3600000), author: 'A. Jones', status: 'Success' },
        ],
        logs: generateLogs('Enrollment Hub', 1.8)
    },
    {
        id: 'app-public-site',
        name: 'Public Website',
        healthStatus: 'Critical',
        apdex: 0.75,
        errorRate: 5.4,
        p95Latency: 3200,
        cpuUtilization: 92,
        memUtilization: 85,
        metrics: {
            latency: generateMetricData(30, 1000, 2000),
            errorRate: generateMetricData(30, 1, 3, 'up'),
            cpu: generateMetricData(30, 70, 95, 'up'),
            memory: generateMetricData(30, 80, 88)
        },
        certificates: [
            { domain: 'www.example.com', issuer: 'Sectigo', expiryDate: addDays(now, -2), daysUntilExpiry: -2, status: 'Expired' },
        ],
        deployments: [
             { id: 8809, timestamp: new Date(now.getTime() - 24 * 3600000), author: 'D. White', status: 'Success' },
             { id: 8808, timestamp: new Date(now.getTime() - 3 * 24 * 3600000), author: 'D. White', status: 'Failed' },
        ],
        logs: generateLogs('Public Website', 5.4)
    }
];

const initialInvestigations: SreInvestigation[] = [
    { id: 'inv-001', title: 'High P95 Latency Detected', appId: 'app-enrollment-hub', appName: 'Enrollment Hub', status: 'Warning', timestamp: new Date(now.getTime() - 10 * 60000) },
    { id: 'inv-002', title: 'Certificate Expired', appId: 'app-public-site', appName: 'Public Website', status: 'Critical', timestamp: new Date(now.getTime() - 2 * 24 * 3600000) },
    { id: 'inv-003', title: 'Elevated Error Rate', appId: 'app-public-site', appName: 'Public Website', status: 'Critical', timestamp: new Date(now.getTime() - 30 * 60000) },
    { id: 'inv-004', title: 'Certificate Nearing Expiry', appId: 'app-enrollment-hub', appName: 'Enrollment Hub', status: 'Active', timestamp: new Date(now.getTime() - 5 * 24 * 3600000) },
];


@Injectable({
  providedIn: 'root',
})
export class SreService {
  private _webApps = signal<WebApp[]>(initialWebApps);
  private _investigations = signal<SreInvestigation[]>(initialInvestigations);

  getWebApps() {
    return this._webApps.asReadonly();
  }

  getInvestigations() {
    return this._investigations.asReadonly();
  }
  
  getCertificates() {
    // Flatten certificates from all apps
    return this._webApps().flatMap(app => app.certificates);
  }

  updateCertificateStatus(domain: string, newStatus: 'Valid') {
     this._webApps.update(apps => {
       apps.forEach(app => {
         const cert = app.certificates.find(c => c.domain === domain);
         if (cert) {
           cert.status = newStatus;
           cert.expiryDate = addDays(new Date(), 365);
           cert.daysUntilExpiry = 365;
         }
       });
       return [...apps];
     })
  }
}
