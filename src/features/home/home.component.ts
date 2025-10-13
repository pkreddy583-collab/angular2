import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ModuleCard {
  title: string;
  description: string;
  strategicObjective: string;
  link: string;
  infographic: {
    type: 'line' | 'bar' | 'donut' | 'status' | 'gauge' | 'text' | 'icon';
    data: any;
    label?: string;
  };
  keyMetrics: {
    label: string;
    value: string;
    trend?: string;
    trendDirection?: 'up' | 'down';
  }[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  modules = signal<ModuleCard[]>([
    {
      title: 'Executive Dashboard',
      description: 'Overall view of production incident trends, TAT, and resolution effectiveness.',
      strategicObjective: 'Understand trend and drive towards lower BMI, TAT, Same Day Resolution and Auto Resolution.',
      link: '/command-center',
      infographic: {
        type: 'line',
        data: [40, 60, 55, 70, 50, 80, 75],
        label: 'Incidents Trend'
      },
      keyMetrics: [
        { label: 'Overall Health', value: '98.2%', trend: '+1.1%', trendDirection: 'up' },
        { label: 'Open P1 Incidents', value: '3', trend: '+1', trendDirection: 'up' },
      ],
    },
    {
      title: 'Incident Management',
      description: 'Analyzes recurring major incidents to identify root causes and patterns.',
      strategicObjective: 'Reduce ticket volumes through trend analysis',
      link: '/incident-management',
      infographic: {
        type: 'bar',
        data: [
          { label: 'P1', value: 3, color: '#ef4444' },
          { label: 'P2', value: 12, color: '#f97316' },
          { label: 'P3', value: 45, color: '#eab308' },
        ],
        label: 'Open Incidents by Priority'
      },
      keyMetrics: [
        { label: 'Active Major Incidents', value: '5' },
        { label: 'Avg. MTTR', value: '4.2 Hrs', trend: '-10%', trendDirection: 'down' },
      ],
    },
    {
      title: 'Change Management',
      description: 'Maintains change history and documentation for reference and audits.',
      strategicObjective: 'Improve audit/compliance visibility',
      link: '/change-management',
      infographic: {
        type: 'donut',
        data: 98.5, // Success rate
        label: 'Success Rate'
      },
      keyMetrics: [
        { label: 'Changes (Last 7d)', value: '142' },
        { label: 'Failed Changes', value: '2', trend: '+1', trendDirection: 'up' },
      ],
    },
    {
      title: 'Certificate Management',
      description: 'Tracks SSL certificates at line of business level for visibility.',
      strategicObjective: 'Prevent outages due to expired certificates',
      link: '/certificate-management',
      infographic: {
        type: 'text',
        data: 7,
        label: 'Expiring Soon'
      },
      keyMetrics: [
        { label: 'Expiring (<30d)', value: '7' },
        { label: 'Total Monitored', value: '1,204' },
      ],
    },
    {
      title: 'Platform Management',
      description: 'Monitors performance of API Management Datapower services and health of clusters.',
      strategicObjective: 'Optimize resource utilization',
      link: '/observability',
      infographic: {
        type: 'status',
        data: [
          { name: 'PCF', status: 'healthy' },
          { name: 'APIM', status: 'healthy' },
          { name: 'Gemfire', status: 'warning' },
          { name: 'Eureka', status: 'critical' },
        ],
        label: 'Platform Health'
      },
      keyMetrics: [
        { label: 'Overall Status', value: 'Degraded' },
        { label: 'Active Alerts', value: '2' },
      ],
    },
    {
      title: 'Site Reliability Engineering',
      description: 'Measures reliability from the perspective of customer experience.',
      strategicObjective: 'Improve customer experience via error budgets',
      link: '/sre-workbench',
      infographic: {
        type: 'gauge',
        data: 72, // Error budget consumed
        label: 'Error Budget Used'
      },
      keyMetrics: [
        { label: 'SLO Compliance', value: '99.8%' },
        { label: 'Error Budget Burn', value: '1.2x' },
      ],
    },
    {
      title: 'Predictive Analytics',
      description: 'Monitors and plans infrastructure capacity proactively.',
      strategicObjective: 'Optimize infrastructure cost',
      link: '/predictive-insights',
      infographic: {
        type: 'line',
        data: [60, 62, 65, 68, 72, 75, 80],
        label: 'CPU Forecast'
      },
      keyMetrics: [
        { label: 'Anomalies Detected (24h)', value: '14' },
        { label: 'Capacity Warnings', value: '1' },
      ],
    },
    {
      title: 'Risk Management',
      description: 'Captures, reviews, and approves risks for governance.',
      strategicObjective: 'Strengthen governance & compliance',
      link: '/risk-management',
      infographic: {
        type: 'text',
        data: 3,
        label: 'High Risks Open'
      },
      keyMetrics: [
        { label: 'Open High Risks', value: '3' },
        { label: 'Total Risks Logged', value: '58' },
      ],
    },
    {
      title: 'Whiteglove',
      description: 'Provides AI-driven assistance to L1 agents for faster resolution.',
      strategicObjective: 'Reduce L1 manual tickets',
      link: '/ai-roi',
      infographic: {
        type: 'donut',
        data: 28, // Automation rate
        label: 'Automation Rate'
      },
      keyMetrics: [
        { label: 'Tickets Automated', value: '28%' },
        { label: 'Time Saved (MTD)', value: '12.5 Hrs' },
      ],
    },
    {
      title: 'Self Service',
      description: 'Helps users schedule changes without L1 involvement.',
      strategicObjective: 'Reduce dependency on support teams',
      link: '/change-management',
      infographic: {
        type: 'text',
        data: '75%',
        label: 'Adoption Rate'
      },
      keyMetrics: [
        { label: 'Adoption Rate', value: '75%' },
        { label: 'Changes Scheduled', value: '218' },
      ],
    },
  ]);

  generateSparklinePath(data: number[], width = 100, height = 40): string {
    if (!data || data.length < 2) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min === 0 ? 1 : max - min;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * (height - 4) + 2; // Add vertical padding
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    return `M ${points.join(' L ')}`;
  }
}
