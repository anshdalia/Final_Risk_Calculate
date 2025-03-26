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
    fines: RiskMetric;
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

export interface RiskState {
    user_inputs: {
        revenue: number;
        employees: number;
        industry: string;
        location: string;
        additional_factors: string[];
    };
    risk_metrics: {
        primary_loss_event_frequency: PrimaryLossEventFrequency;
        secondary_loss_event_frequency: SecondaryLossEventFrequency;
        primary_loss_magnitude: LossMagnitude;
        secondary_loss_magnitude: LossMagnitude;
    };
    scenarios: Scenario[];
    selected_scenario: Scenario;
    dynamic_questions: string[];
    question_answers: Record<string, string>;
    industry_analysis: {
        insights: {
            breach_cost: {
                amount: number;
                year: number;
                source: string;
                analysis: string;
            };
            attack_vectors: Array<{
                type: string;
                percentage: number;
                source: string;
                impact_analysis: string;
            }>;
            response_times: {
                time_to_identify: number;
                time_to_contain: number;
                source: string;
                analysis: string;
            };
        };
        regional_cyber_crimes: Array<{
            crime_type: string;
            statistics: string;
            year: number;
            regional_impact: string;
        }>;
    };
    risk_statement: string;
    fair_score: number;
    fair_score_explanation: string;
    remediation_suggestions: Array<{
        title: string;
        description: string;
        impact: string;
        implementation: string;
    }>;
}

export interface InitialInputFormData {
    revenue: string;
    employees: string;
    industry: string;
    location: string;
    additional_factors: string[];
} 