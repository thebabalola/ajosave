// Self.xyz related type definitions

export interface SelfVerificationResult {
  attestationId: number;
  proof: any;
  publicSignals: any[];
  userContextData: string;
  credentialSubject?: any;
  verified: boolean;
}

export interface SelfAppConfig {
  version: number;
  appName: string;
  scope: string;
  endpoint: string;
  logoBase64: string;
  userId: string;
  endpointType: string;
  userIdType: string;
  userDefinedData: string;
  disclosures: {
    minimumAge: number;
    nationality: boolean;
    gender: boolean;
    excludedCountries: string[];
    ofac: boolean;
  };
}

