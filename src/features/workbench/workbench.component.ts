import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ControlmService } from '../../services/controlm.service';
import { SreService } from '../../services/sre.service';
import { GeminiService } from '../../services/gemini.service';
import { ControlMJob, AiSuggestion } from '../../models/controlm.model';
import { WebApp, AiInsight, SreInvestigation, SSLCertificate } from '../../models/sre.model';
import { DbreService } from '../../services/dbre.service';
import { SlowQuery } from '../../models/dbre.model';
import { ExplainPlanNodeComponent } from './explain-plan-node/explain-plan-node.component';
import { PostmortemService } from '../../services/postmortem.service';
import { PostmortemReport, TimelineEvent, ActionItem } from '../../models/postmortem.model';
import { FinopsService } from '../../services/finops.service';
import { FinOpsApp, SavingsOpportunity } from '../../models/finops.model';


type WorkbenchType = 'controlM' | 'sre' | 'dbre' | 'postmortem' | 'finops';
type SreSubView = 'investigations' | 'certificates' | 'performance';
type ActionStatus = 'idle' | 'loading' | 'success' | 'failed';

@Component({
  selector: 'app-workbench',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ExplainPlanNodeComponent],
  templateUrl: './workbench.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkbenchComponent {
  private controlmService = inject(ControlmService);
  private sreService = inject(SreService);
  private dbreService = inject(DbreService);
  private postmortemService = inject(PostmortemService);
  private finopsService = inject(FinopsService);
  private geminiService = inject(GeminiService);

  // --- Global Workbench State ---
  activeWorkbench = signal<WorkbenchType>('controlM');

  // --- Control-M Workbench State ---
  controlMJobs = this.controlmService.getFailedJobs();
  selectedControlMJob = signal<ControlMJob | null>(null);
  controlMAiSuggestions = signal<AiSuggestion[]>([]);
  isLoadingControlMSuggestions = signal(false);
  
  // --- SRE Workbench State ---
  sreSubView = signal<SreSubView>('investigations');
  sreInvestigations = this.sreService.getInvestigations();
  allWebApps = this.sreService.getWebApps();
  selectedInvestigationId = signal<string | null>(null);
  
  selectedInvestigation = computed(() => this.sreInvestigations().find(i => i.id === this.selectedInvestigationId()));
  selectedWebApp = computed(() => {
    const investigation = this.selectedInvestigation();
    return this.allWebApps().find(app => app.id === investigation?.appId);
  });
  
  initialTriage = signal('');
  logAnalysisResult = signal('');
  actionStatuses = signal<{ [key: string]: ActionStatus }>({
    triage: 'idle', logs: 'idle', cache: 'idle', restart: 'idle',
    config: 'idle', memory: 'idle'
  });
  
  certificates = this.sreService.getCertificates();
  renewalStatus = signal<{ [domain: string]: { status: string, step: number } }>({});
  selectedCert = signal<SSLCertificate | null>(null);
  
  performanceToolResults = signal<{ [key:string]: string }>({});

  // --- DBRE Workbench State ---
  slowQueries = this.dbreService.getSlowQueries();
  selectedSlowQuery = signal<SlowQuery | null>(null);
  explainPlanAnalysis = signal('');
  optimizedQuery = signal('');
  isLoadingDbre = signal<{ analysis: boolean; optimization: boolean }>({ analysis: false, optimization: false });

  // --- Postmortem Workbench State ---
  postmortemIncidents = this.postmortemService.getIncidentsForPostmortem();
  activePostmortem = signal<PostmortemReport | null>(null);
  isLoadingPostmortem = signal<{ [key: string]: boolean }>({});

  // --- FinOps Workbench State ---
  finopsApps = this.finopsService.getFinOpsApps();
  selectedFinopsApp = signal<FinOpsApp | null>(null);
  savingsOpportunities = signal<SavingsOpportunity[]>([]);
  isLoadingSavings = signal(false);

  constructor() {
    effect(() => {
        const investigation = this.selectedInvestigation();
        const app = this.selectedWebApp();
        if (investigation && app && this.activeWorkbench() === 'sre') {
            this.resetSreActions();
            this.actionStatuses.update(s => ({ ...s, triage: 'loading' }));
            this.geminiService.getInitialSreInvestigation(investigation, app).then(summary => {
                this.initialTriage.set(summary);
                this.actionStatuses.update(s => ({ ...s, triage: 'success' }));
            });
        }
    }, { allowSignalWrites: true });
  }

  selectWorkbench(workbench: WorkbenchType): void {
    this.activeWorkbench.set(workbench);
  }

  // --- Control-M Methods ---
  selectControlMJob(job: ControlMJob): void {
    this.selectedControlMJob.set(job);
    this.controlMAiSuggestions.set([]);
    this.isLoadingControlMSuggestions.set(false);
  }

  async getControlMAiSuggestions(): Promise<void> {
    const job = this.selectedControlMJob();
    if (!job) return;

    this.isLoadingControlMSuggestions.set(true);
    this.controlMAiSuggestions.set([]);
    try {
      const suggestions = await this.geminiService.getControlmSuggestions(job);
      this.controlMAiSuggestions.set(suggestions);
    } catch (error) {
      console.error('Failed to get AI suggestions', error);
      this.controlMAiSuggestions.set([{ title: 'Error', description: 'Failed to retrieve AI suggestions.', actionType: 'info' }]);
    } finally {
      this.isLoadingControlMSuggestions.set(false);
    }
  }
  
  // --- SRE Methods ---
  selectSreSubView(view: SreSubView): void { this.sreSubView.set(view); }
  selectInvestigation(id: string): void { this.selectedInvestigationId.set(id); }
  
  resetSreActions(): void {
    this.initialTriage.set('');
    this.logAnalysisResult.set('');
    this.performanceToolResults.set({});
    this.actionStatuses.set({
      triage: 'idle', logs: 'idle', cache: 'idle', restart: 'idle',
      config: 'idle', memory: 'idle'
    });
  }

  async analyzeLogs(): Promise<void> {
    const app = this.selectedWebApp();
    const investigation = this.selectedInvestigation();
    if (!app || !investigation) return;
    this.actionStatuses.update(s => ({...s, logs: 'loading'}));
    const result = await this.geminiService.analyzeSreLogs(app.logs, investigation.title);
    this.logAnalysisResult.set(result);
    this.actionStatuses.update(s => ({...s, logs: 'success'}));
  }

  async clearCache(): Promise<void> {
    this.actionStatuses.update(s => ({...s, cache: 'loading'}));
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    this.actionStatuses.update(s => ({...s, cache: 'success'}));
    setTimeout(() => this.actionStatuses.update(s => ({...s, cache: 'idle'})), 3000);
  }
  
  async restartService(): Promise<void> {
    this.actionStatuses.update(s => ({...s, restart: 'loading'}));
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate API call
    this.actionStatuses.update(s => ({...s, restart: 'success'}));
     setTimeout(() => this.actionStatuses.update(s => ({...s, restart: 'idle'})), 3000);
  }
  
  getInvestigationStatusClass(status: SreInvestigation['status']) {
    switch(status) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      case 'Active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  async renewCertificate(cert: SSLCertificate): Promise<void> {
    this.renewalStatus.update(s => ({ ...s, [cert.domain]: { status: 'Requesting...', step: 1 } }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.renewalStatus.update(s => ({ ...s, [cert.domain]: { status: 'Validating DNS...', step: 2 } }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.renewalStatus.update(s => ({ ...s, [cert.domain]: { status: 'Issuing Certificate...', step: 3 } }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.renewalStatus.update(s => ({ ...s, [cert.domain]: { status: 'Deploying...', step: 4 } }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.sreService.updateCertificateStatus(cert.domain, 'Valid');
    this.renewalStatus.update(s => ({ ...s, [cert.domain]: { status: 'Renewed Successfully!', step: 5 } }));
  }
  
  getCertStatusClass(status: 'Valid' | 'Expires Soon' | 'Expired') {
    switch(status) {
      case 'Expired': return 'bg-red-100 border-red-500';
      case 'Expires Soon': return 'bg-yellow-100 border-yellow-500';
      case 'Valid': return 'bg-green-100 border-green-500';
    }
  }
  
  // --- DBRE Methods ---
  selectSlowQuery(query: SlowQuery): void {
    this.selectedSlowQuery.set(query);
    this.explainPlanAnalysis.set('');
    this.optimizedQuery.set('');
  }

  async analyzeExplainPlan(): Promise<void> {
    const query = this.selectedSlowQuery();
    if (!query) return;
    this.isLoadingDbre.update(s => ({...s, analysis: true}));
    const analysis = await this.geminiService.explainDbPlan(query.explainPlan);
    this.explainPlanAnalysis.set(analysis);
    this.isLoadingDbre.update(s => ({...s, analysis: false}));
  }

  async getQueryOptimization(): Promise<void> {
    const query = this.selectedSlowQuery();
    if (!query) return;
    this.isLoadingDbre.update(s => ({...s, optimization: true}));
    const suggestion = await this.geminiService.optimizeSqlQuery(query.query, query.explainPlan);
    this.optimizedQuery.set(suggestion);
    this.isLoadingDbre.update(s => ({...s, optimization: false}));
  }

  // --- Postmortem Methods ---
  startPostmortem(incident: { id: string, title: string }): void {
    this.activePostmortem.set({
      incidentId: incident.id,
      incidentTitle: incident.title,
      timeline: [],
      rootCauseAnalysis: '',
      actionItems: [],
      executiveSummary: ''
    });
  }

  async generateTimeline(): Promise<void> {
    const pm = this.activePostmortem();
    if (!pm) return;
    this.isLoadingPostmortem.update(s => ({ ...s, timeline: true }));
    const timeline = await this.geminiService.generatePostmortemTimeline(pm.incidentTitle);
    this.activePostmortem.update(p => p ? { ...p, timeline } : null);
    this.isLoadingPostmortem.update(s => ({ ...s, timeline: false }));
  }

  async generateRca(): Promise<void> {
    const pm = this.activePostmortem();
    if (!pm || pm.timeline.length === 0) return;
    this.isLoadingPostmortem.update(s => ({ ...s, rca: true }));
    const rca = await this.geminiService.suggestRca(pm.timeline);
    this.activePostmortem.update(p => p ? { ...p, rootCauseAnalysis: rca } : null);
    this.isLoadingPostmortem.update(s => ({ ...s, rca: false }));
  }

  async generateActionItems(): Promise<void> {
    const pm = this.activePostmortem();
    if (!pm || !pm.rootCauseAnalysis) return;
    this.isLoadingPostmortem.update(s => ({ ...s, actions: true }));
    const items = await this.geminiService.suggestActionItems(pm.rootCauseAnalysis);
    this.activePostmortem.update(p => p ? { ...p, actionItems: items } : null);
    this.isLoadingPostmortem.update(s => ({ ...s, actions: false }));
  }

  // --- FinOps Methods ---
  selectFinopsApp(app: FinOpsApp): void {
    this.selectedFinopsApp.set(app);
    this.savingsOpportunities.set([]);
  }

  async findSavings(): Promise<void> {
    const app = this.selectedFinopsApp();
    if (!app) return;
    this.isLoadingSavings.set(true);
    const opportunities = await this.geminiService.findCloudSavings(app);
    this.savingsOpportunities.set(opportunities);
    this.isLoadingSavings.set(false);
  }
}
