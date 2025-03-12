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
    industry_analysis: any;
    historical_analysis: any;
    remediation_suggestions: string[];
}

export interface InitialInputFormData {
    revenue: number;
    employees: number;
    industry: string;
    location: string;
    additional_factors?: string[];
} 