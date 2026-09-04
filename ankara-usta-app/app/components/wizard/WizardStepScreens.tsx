import {ReactNode} from 'react';

type StepScreenProps={kicker:string;title:string;description?:string;note?:ReactNode;children:ReactNode};

function StepScreen({kicker,title,description,note,children}:StepScreenProps){
  return <div className="wizard-step-content animate-fade-in"><header className="step-content-header"><span className="step-kicker">{kicker}</span><h2 id="wizard-title" tabIndex={-1} className="step-main-title">{title}</h2>{description&&<p className="step-sub-desc">{description}</p>}{note}</header>{children}</div>;
}

export function WizardQuestionStep(props:StepScreenProps){return <StepScreen {...props}/>;}
export function WizardMediaStep(props:StepScreenProps){return <StepScreen {...props}/>;}
export function WizardLocationStep(props:StepScreenProps){return <StepScreen {...props}/>;}
export function WizardSummaryStep(props:StepScreenProps){return <StepScreen {...props}/>;}
