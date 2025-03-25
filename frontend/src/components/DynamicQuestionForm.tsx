import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RiskMetricsDisplay } from '@/components/RiskMetricsDisplay';

interface DynamicQuestionFormProps {
  state: {
    risk_statement: string;
    risk_metrics: any; // Replace 'any' with your actual metrics type
  };
}

const DynamicQuestionForm: React.FC<DynamicQuestionFormProps> = ({ state }) => {
  return (
    <div className="space-y-6">
      {/* Formalized Risk Statement Card */}
      <Card>
        <CardHeader>
          <CardTitle>Formalized Risk Statement (ISO 27001)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {state.risk_statement}
          </p>
        </CardContent>
      </Card>

      {/* Risk Metrics Display */}
      <RiskMetricsDisplay metrics={state.risk_metrics} />
    </div>
  );
};

export default DynamicQuestionForm; 