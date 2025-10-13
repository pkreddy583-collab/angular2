import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BusinessUserService } from '../../services/business-user.service';
import { GeminiService } from '../../services/gemini.service';
import { BusinessService } from '../../models/business-user.model';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-business-user-hub',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './business-user-hub.component.html',
  styleUrls: ['./business-user-hub.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessUserHubComponent {
  private businessUserService = inject(BusinessUserService);
  private geminiService = inject(GeminiService);

  userServices = this.businessUserService.getUserServices();
  
  chatQuery = new FormControl('');
  chatHistory = signal<ChatMessage[]>([]);
  isLoadingResponse = signal(false);

  quickActions = [
    'Is the Enrollment Hub working?',
    'Report an issue with the HR Portal',
    'What is the status of the public website?'
  ];

  constructor() {
      this.chatHistory.set([{
          sender: 'ai',
          text: 'Welcome! I am your AI Concierge. How can I help you today?'
      }]);
  }

  getServiceStatusClass(status: BusinessService['status']): string {
    switch (status) {
      case 'Healthy': return 'bg-green-500';
      case 'Degraded': return 'bg-yellow-500';
      case 'Outage': return 'bg-red-500';
    }
  }

  async sendQuery(query?: string): Promise<void> {
    const userQuery = query || this.chatQuery.value;
    if (!userQuery || this.isLoadingResponse()) return;

    this.isLoadingResponse.set(true);
    this.chatHistory.update(history => [...history, { sender: 'user', text: userQuery }]);
    this.chatQuery.reset();

    try {
      const aiResponse = await this.geminiService.getAiConciergeResponse(userQuery, this.userServices());
      this.chatHistory.update(history => [...history, { sender: 'ai', text: aiResponse }]);
    } catch (e) {
      this.chatHistory.update(history => [...history, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      this.isLoadingResponse.set(false);
    }
  }
}
