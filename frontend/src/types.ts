export interface RiskMetric {
    min: number;
    likely: number;
    max: number;
    confidence: number;
}

export interface PrimaryLossEventFrequency {
    threat_event_frequency: RiskMetric;
    vulnerability: RiskMetric;
}

export interface SecondaryLossEventFrequency {
    SLEF: RiskMetric;
}

export interface LossMagnitude {
    productivity: RiskMetric;
    response: RiskMetric;
    replacement: RiskMetric;
    competitive_advantage: RiskMetric;
    fines_and_judgements: RiskMetric;
    reputation: RiskMetric;
}

export interface RiskMetrics {
    risk_score: number;
    tef: number;
    lm: number;
    primary_loss_event_frequency: PrimaryLossEventFrequency;
    secondary_loss_event_frequency: SecondaryLossEventFrequency;
    primary_loss_magnitude: LossMagnitude;
    secondary_loss_magnitude: LossMagnitude;
}

export interface Scenario {
    description: string;
    severity_level: string;
    potential_impact: string;
}

interface HistoricalIncident {
    date: string;
    industry: string;
    event_type: string;
    description: string;
    financial_impact: number | null;
    affected_count: number | null;
    similarity_score: number;
}

interface HistoricalAnalysisSummary {
    total_matches: number;
    avg_financial_impact: number;
    most_common_type: string;
}

interface RiskAdjustments {
    frequency_factor: number;
    magnitude_factor: number;
    confidence: number;
}

interface HistoricalAnalysis {
    similar_incidents: HistoricalIncident[];
    risk_adjustments: RiskAdjustments;
    summary: HistoricalAnalysisSummary;
}

export interface RiskState {
    risk_metrics: RiskMetrics;
    user_inputs: {
        revenue: number;
        employees: number;
        industry: string;
        location: string;
        additional_factors: string[];
    };
    scenarios: Array<Scenario>;
    selected_scenario: Scenario;
    dynamic_questions: string[];
    question_answers: { [key: string]: string };
    historical_analysis?: {
        similar_incidents: any[];
        risk_adjustments: {
            frequency_factor: number;
            magnitude_factor: number;
            confidence: number;
        };
        summary: {
            total_matches: number;
            most_common_type: string;
            avg_financial_impact: number;
        };
        risk_metrics?: {
            primary_loss_event_frequency: PrimaryLossEventFrequency;
            secondary_loss_event_frequency: SecondaryLossEventFrequency;
            primary_loss_magnitude: LossMagnitude;
            secondary_loss_magnitude: LossMagnitude;
        };
    };
    remediation_suggestions: string[];
}

export interface InitialInputFormData {
    revenue: string;
    employees: string;
    industry: string;
    location: string;
    additional_factors: string[];
} 