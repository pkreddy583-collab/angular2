import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  exportToCsv(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      console.error('No data to export');
      return;
    }

    const replacer = (key: any, value: any) => (value === null ? '' : value);
    const header = Object.keys(data[0]);
    const csv = [
      header.join(','), // header row
      ...data.map((row) =>
        header
          .map((fieldName) => {
            const fieldValue = row[fieldName];
            // Handle values that might contain commas
            const stringValue = JSON.stringify(fieldValue, replacer);
            // Remove quotes from simple strings/numbers but keep them for strings with commas
            if (stringValue.startsWith('"') && stringValue.endsWith('"') && !stringValue.includes(',')) {
                return stringValue.slice(1, -1);
            }
            return stringValue;
          })
          .join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
