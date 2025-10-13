export type CiType = 'Application' | 'Server' | 'Database' | 'Network Device';
export type CiEnvironment = 'Production' | 'Staging' | 'QA';
export type CiStatus = 'Healthy' | 'Warning' | 'Critical';

export interface CiRelationship {
  targetId: string;
  type: 'Depends on' | 'Used by';
}

export interface ConfigurationItem {
  id: string;
  name: string;
  type: CiType;
  environment: CiEnvironment;
  status: CiStatus;
  owner: string;
  properties: { [key: string]: string };
  relationships: CiRelationship[];
  relatedChanges: string[];
  relatedIncidents: string[];
}
