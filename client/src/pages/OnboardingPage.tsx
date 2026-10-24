import React, { useState } from 'react';
import { LearningGoal } from '../types/contract';
import { InterpretedPlan } from '../types/onboarding';
import { DomainCapability, DomainSelection } from '../types/domain';
import { resolveDomainCapability, getDefaultDomain } from '../lib/domainRegistry';
import { interpretLearningGoal } from '../lib/goalInterpreter';
import { DomainSelectionStep } from './DomainSelectionStep';
import { GoalInputStep } from './GoalInputStep';
import { ContextStep, ContextStepData } from './ContextStep';
import { PlanSummaryStep } from './PlanSummaryStep';

interface OnboardingPageProps {
  onConfirmGoal: (goal: LearningGoal) => void;
  initialGoal?: LearningGoal | null;
}

type OnboardingStep = 'domain' | 'input' | 'context' | 'summary';

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onConfirmGoal,
  initialGoal
}) => {
  // Determine initial domain capability
  const initialDomainId = initialGoal?.personalizedContext?.domain || 'sql';
  const initialCapability = resolveDomainCapability(initialDomainId).capability;

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('domain');
  const [selectedDomain, setSelectedDomain] = useState<DomainCapability>(initialCapability);
  const [customDomainName, setCustomDomainName] = useState<string>(
    initialDomainId.startsWith('custom-') ? initialGoal?.personalizedContext?.domain || '' : ''
  );

  const [rawGoalText, setRawGoalText] = useState<string>(
    initialGoal?.personalizedContext?.rawGoalText || ''
  );

  const [contextData, setContextData] = useState<ContextStepData>({
    experienceLevel: initialGoal?.personalizedContext?.experienceLevel || 'some_experience',
    timePerSession: initialGoal?.personalizedContext?.timePerSessionMinutes || 30,
    deadline: initialGoal?.personalizedContext?.deadline || '',
    strugglingTopics: initialGoal?.personalizedContext?.focusTopics || []
  });

  const [interpretedPlan, setInterpretedPlan] = useState<InterpretedPlan | null>(null);

  // Step 0: Domain Selection -> Step 1: Goal Input
  const handleDomainContinue = (selection: DomainSelection) => {
    setSelectedDomain(selection.capability);
    setCustomDomainName(selection.customDomainName || '');
    setCurrentStep('input');
  };

  // Step 1: Goal Input -> Step 2: Context
  const handleGoalInputContinue = (text: string) => {
    setRawGoalText(text);
    setCurrentStep('context');
  };

  // Helper to run interpretation
  const generatePlan = (domain: DomainCapability, ctx: ContextStepData, goalText: string) => {
    return interpretLearningGoal({
      rawGoalText: goalText,
      experienceLevel: ctx.experienceLevel,
      timePerSession: ctx.timePerSession,
      deadline: ctx.deadline,
      strugglingTopics: ctx.strugglingTopics,
      domainId: domain.id,
      domainName: domain.name,
      domainStatus: domain.status
    });
  };

  // Step 2: Context -> Step 3: Plan Summary
  const handleContextContinue = (data: ContextStepData) => {
    setContextData(data);
    const plan = generatePlan(selectedDomain, data, rawGoalText);
    setInterpretedPlan(plan);
    setCurrentStep('summary');
  };

  // Switch to supported SQL track from limitation callout
  const handleSwitchToSupported = () => {
    const sqlDomain = getDefaultDomain();
    setSelectedDomain(sqlDomain);
    setCustomDomainName('');
    const updatedPlan = generatePlan(sqlDomain, contextData, rawGoalText);
    setInterpretedPlan(updatedPlan);
  };

  // Step 3: Confirm plan & launch workspace (for supported tracks)
  const handleConfirmPlan = () => {
    if (!interpretedPlan || selectedDomain.status !== 'supported') return;

    const goal: LearningGoal = {
      id: `goal-${selectedDomain.id}-${Date.now()}`,
      title: interpretedPlan.title,
      description: interpretedPlan.summary,
      estimatedMinutes: interpretedPlan.estimatedMinutes,
      personalizedContext: {
        rawGoalText: interpretedPlan.rawGoalText,
        experienceLevel: interpretedPlan.experienceLevel,
        timePerSessionMinutes: interpretedPlan.timePerSession,
        deadline: interpretedPlan.deadline,
        focusTopics: interpretedPlan.strugglingTopics,
        startingNodeId: interpretedPlan.recommendedStartingNodeId,
        rationale: interpretedPlan.startingLevel,
        domain: selectedDomain.id,
        domainStatus: selectedDomain.status
      }
    };

    onConfirmGoal(goal);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {currentStep === 'domain' && (
        <DomainSelectionStep
          initialDomainId={selectedDomain.id}
          initialCustomDomainName={customDomainName}
          onContinue={handleDomainContinue}
        />
      )}

      {currentStep === 'input' && (
        <GoalInputStep
          initialGoalText={rawGoalText}
          domainName={selectedDomain.name}
          onBack={() => setCurrentStep('domain')}
          onContinue={handleGoalInputContinue}
        />
      )}

      {currentStep === 'context' && (
        <ContextStep
          initialData={contextData}
          onBack={() => setCurrentStep('input')}
          onContinue={handleContextContinue}
        />
      )}

      {currentStep === 'summary' && interpretedPlan && (
        <PlanSummaryStep
          plan={interpretedPlan}
          domain={selectedDomain}
          onBack={() => setCurrentStep('context')}
          onEdit={() => setCurrentStep('input')}
          onSwitchToSupported={handleSwitchToSupported}
          onConfirm={handleConfirmPlan}
        />
      )}
    </div>
  );
};
