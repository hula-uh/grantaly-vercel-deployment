'use client'


export const dynamic = "force-dynamic"
import React from 'react';
import { useState, useId, lazy, Suspense } from 'react';
import { NavBar } from '@/components/PI-Components/multi-step/navbar/NavBar';
import StepIndicator from '@/components/PI-Components/multi-step/StepIndicator';
import styles from './pi.module.scss'
import PersonalInfoCard from '@/components/PI-Components/registration-step-cards/PersonalInfoCard';
import { ProjectStep1Schema } from '@/Validation/Client/validator';
import toast from 'react-hot-toast';
import axios from 'axios';
import DocumentUpload from '@/components/PI-Components/registration-step-cards/DocumentUpload';
import { DataUploadLink, File, user } from '@/interface/interface';
import DataUpload from '@/components/PI-Components/registration-step-cards/FinishingUpCard';
import ResultDelivery from '@/components/PI-Components/registration-step-cards/ResultDelivery';


const PlanCard = lazy(() => import('@/components/PI-Components/registration-step-cards/PlanCard'));
const ThankYouCard = lazy(() => import('@/components/PI-Components/registration-step-cards/ThankYouCard'));

const steps = [
  { id: '1', name: 'Project Information Form' },
  { id: '2', name: 'Meeting Booking' },
  { id: '3', name: 'Contract Management' },
  { id: '4', name: 'Data Upload' },
  { id: '5', name: 'Result Delivery' },
];

import { Admin, ObjectId } from 'mongodb';
import { Role } from '@/types/enum';
import AdminWait from './AdminWait';
import ClientWait from './ClientWait';

interface ProjectProps {
  _id: ObjectId;
  projectTitle: string;
  abstract: string;
  fundingAgency: string;
  startDate: Date;
  endDate: Date;
  expectedTimeline: string;
  isCompeleted: boolean;
  formStep: number;
  isBooked: boolean;
  userId: ObjectId;
  clientDocs: any[]; // Replace `any` with the specific type if you have it for documents
  adminDocs: any[];  // Replace `any` with the specific type if you have it for documents
  dataUploadContent: any[]; // Replace `any` with the specific type if you have it for content
  resultContent: any[]; // Replace `any` with the specific type if you have it for content
  __v: number;
  dataUploadDeadline: string;
  resultUploadDeadline: string;
}

interface props {
  Project: ProjectProps;
  currentUser: user;
}

export default function EditProject({Project,currentUser}:props) {

  const formatDate = (date: Date) => new Date(date).toISOString().split('T')[0];

  const isAdmin = currentUser?.role === Role.ADMIN ? true : false

  let stepper =0;
  if(isAdmin && Project.formStep === 3) {
    stepper = 2;
  }
  else if(isAdmin && Project.formStep === 2) {
    stepper = 2;
  }
  else if(!isAdmin && Project.formStep === 3 && Project.clientDocs.length ===0) {
    stepper = 2;
  }
  else if(!isAdmin && Project.formStep === 4) {
    stepper = 3;
  } 
  else if(!isAdmin && Project.formStep === 5){
    stepper = 4;
  } else if(isAdmin && Project.formStep === 5){
    stepper = 4;
  } else {
    stepper = Project.formStep;
  }

  

  const [step, setStep] = useState(stepper);

  console.log('awdadsd',stepper,isAdmin,step)
  const [isComplete, setIsComplete] = useState(Project.isCompeleted);
  const [projectId,setProjectId] = useState(Project._id);

  // State for each form field
  const [projectTitle, setProjectTitle] = useState(Project?.projectTitle ?? '');
  const [abstract, setAbstract] = useState(Project?.abstract ?? '');
  const [fundingAgency, setFundingAgency] = useState(Project?.fundingAgency ?? '');
  const [startDate, setStartDate] = useState(Project?.startDate ? formatDate(Project?.startDate) : '');
  const [endDate, setEndDate] = useState(Project?.endDate ? formatDate(Project?.endDate) : '');
  const [expectedTimeline, setExpectedTimeline] = useState(Project?.expectedTimeline ?? '');

  // Step3 UseStates
  const [clientDocs, setClientDocs] = useState<File[]>(Project?.clientDocs ?? []);
  const [adminDocs, setAdminDocs] = useState<File[]>(Project?.adminDocs ?? []);
  const [dataUploadDeadline,setDataUploadDeadline] = useState<string>(Project?.dataUploadDeadline ?? '');
  const [resultUploadDeadline,setResultUploadDeadline] = useState<string>(Project?.resultUploadDeadline ?? '');
  // if Admin Submits date and Contract
  const [hasAdminSubmittedContract,setHasAdminSubmittedContract] = 
  useState<boolean>(Project?.adminDocs && Project?.dataUploadDeadline && Project?.resultUploadDeadline && (Project?.clientDocs.length === 0 || Project?.dataUploadContent.length === 0) ? true : false);

  // Step 4 Urls
  const [dataUploadContent,setDataUploadContent] = useState<DataUploadLink[]>(Project?.dataUploadContent ?? []);
  const [hasClientSubmittedUploadUrl,setHasClientSubmittedUploadUrl] = useState<boolean>(Project?.dataUploadContent.length ? true : false);

  // Step 5 Urls
  const [resultContent,setResultContent] = useState<DataUploadLink[]>(Project?.resultContent ?? [])


  

  const goToNextStep = async () => {
    if(step === 0){
      const data = {projectTitle,abstract,fundingAgency,startDate,endDate,expectedTimeline};
      const { value, error } = ProjectStep1Schema.validate({projectTitle,abstract,fundingAgency,startDate,endDate,expectedTimeline}, { abortEarly: false });
      if(endDate < startDate){
        toast.error('End date cannot be before start date');
        return;
      }

      if (error) {
        // Show the first error message in a toast
        toast.error(error.details[0].message);
        return;
      }

      else {
        try {
          if(projectId) {
            const response = await axios.put(`/api/project/${projectId}/step/${step+1}`, data);  
            setProjectId(response.data.projectId);
            setStep((prevStep) => prevStep + 1)
            toast.success('Progress Saved...')
          } else {
            const response = await axios.post(`/api/project/${projectId}/step/${step+1}`, data);
            setProjectId(response.data.projectId);
            setStep((prevStep) => prevStep + 1)
            toast.success('Progress Update Saved...')
          }
        } catch (error) {
          toast.error('failed to save progress')
        }
        // setStep((prevstep) => prevstep+1 )
      }
    }

    if(step === 1){
      try {
        if(projectId) {
          const response = await axios.put(`/api/project/${projectId}/step/${step+1}`, {isBooked: true});  
          setStep((prevStep) => prevStep + 1)
          toast.success('Progress Saved...')
        } 
      } catch (error) {
        toast.error('failed to save progress')
      } 
    }

    if(step === 2){
      if(isAdmin && adminDocs && adminDocs.length === 0){
        toast.error("Please upload your contract");
        return;
      }

      if(!isAdmin && adminDocs && adminDocs.length === 0){
        toast.error("You can't progress until admin uploads a contract");
        return;
      }
      if(clientDocs.length === 0 && adminDocs.length === 0){
        toast.error('Please upload at least one document')
        return;
      }
      if(!isAdmin && clientDocs.length === 0){
        toast.error("Please upload atleast one document");
        return;
      }

      if(!dataUploadDeadline || !resultUploadDeadline){
        toast.error('Please select your deadlines');
        return;
      }
      
      try {
        if(projectId) {
          const response = await axios.put(`/api/project/${projectId}/step/${step+1}`, {clientDocs,adminDocs,dataUploadDeadline,resultUploadDeadline});  
          if(response.data){
            if(isAdmin && dataUploadContent.length === 0){
                setHasAdminSubmittedContract(true)
            } else {
              setStep((prevStep) => prevStep + 1)
            }
            if(isAdmin && hasAdminSubmittedContract){
            toast.success('Progress Saved...')
            toast.success('You will continue to next step once user upload the contract and data')
            } else {
              toast.success('Progress Saved...')
            }
          }
        }  
      } catch (error) {
        toast.error('failed to save progress')
      } 
    }

    const validateUrls = (e:DataUploadLink[]) => {
      if (
          e.length === 0 ||
          e.some((data) => data.url.trim() === '' || data.description.trim() === '')
      ) {
          toast.error('Please ensure all URLs and descriptions are filled in, and that you have at least one entry.');
          return false;
      }
      return true;
  };

    if(step === 3){
      if (!validateUrls(dataUploadContent)){
        return;
      }
      try {
          const response = await axios.put(`/api/project/${projectId}/step/${step+1}`, {dataUploadContent});  
          if(response.data){
            if(!isAdmin && resultContent.length === 0){
              setHasClientSubmittedUploadUrl(true)
            } else
            setStep((prevStep) => prevStep + 1)

            if(hasClientSubmittedUploadUrl){
              toast.success('Progress Saved...')
              toast.success('You will continue to next step once results will uploaded')
            } else
            toast.success('Progress Saved...')
          }
      } catch (error) {
        toast.error('failed to save progress')
      } 
    }

    if(step === 4){
      if (!validateUrls(resultContent)){
        return;
      }
      try {
          const response = await axios.put(`/api/project/${projectId}/step/${step+1}`, {resultContent});  
          if(response.data){
            setStep(8) 
            toast.success('Progress Saved...')
          }
      } catch (error) {
        toast.error('failed to save progress')
      } 
    }
  };

  console.log(step,"I am stepper")


  const goToPrevStep = () => setStep((prevStep) => prevStep - 1);
  const goToPlanStep = () => setStep(1);
  const finish = () => setIsComplete(true);

  // Handler for updating addons
  

  return (
    <div className='mb-80 flex justify-center' >
      <main className={styles.main}>
        {step < 5 &&
          <StepIndicator steps={steps} currentStep={steps[step].id} />
        }
        <Suspense fallback="Loading...">
          <div className={styles.content} style={{height:'100%',alignSelf:'center'}}>
            {!isComplete ? (
              <>
                <div className={styles.cardWrapper}>
                  {step === 0 && (
                    <PersonalInfoCard
                      projectTitle={projectTitle}
                      abstract={abstract}
                      fundingAgency={fundingAgency}
                      startDate={startDate}
                      endDate={endDate}
                      expectedTimeline={expectedTimeline}
                      setProjectTitle={setProjectTitle}
                      setAbstract={setAbstract}
                      setFundingAgency={setFundingAgency}
                      setStartDate={setStartDate}
                      setEndDate={setEndDate}
                      setExpectedTimeline={setExpectedTimeline}
                  />
                  )}
                  {step === 1 && (
                    <PlanCard/>
                  )}
                  {step === 2 && (
                    <DocumentUpload hasAdminSubmittedContract={hasAdminSubmittedContract} setResultUploadDeadline={setResultUploadDeadline} setDataUploadDeadline={setDataUploadDeadline} resultUploadDeadline={resultUploadDeadline} dataUploadDeadline={dataUploadDeadline} currentUser={currentUser} adminDocs={adminDocs} clientDocs={clientDocs} setAdminDocs={setAdminDocs} setClientDocs={setClientDocs}/>
                  )}
                  {step === 3 && (
                    <DataUpload
                      hasClientSubmittedUploadUrl={hasClientSubmittedUploadUrl}
                      dataUploadContent={dataUploadContent}
                      setDataUploadContent={setDataUploadContent}
                    />
                  )}
                  {step === 4 && (
                    <ResultDelivery
                      isAdmin={isAdmin}
                      resultContent={resultContent}
                      setResultContent={setResultContent}
                    />
                  )}
                  {step === 6 && (
                    <AdminWait setStep={() => {setStep(Project.formStep - 1)}}/>
                  )}
                  {step === 7 && (
                    <ClientWait setStep={() => {setStep(Project.formStep - 1)}}/>
                  )}
                  {step === 8 && (
                    <ThankYouCard isAdmin={isAdmin}/>
                  )}
                </div>

                {step < 6 && <NavBar
                  steps={steps.length}
                  currentStep={step}
                  isAtPersonalInfoStep={step === steps.length}
                  onBackButtonClick={goToPrevStep}
                  onNextStepButtonClick={goToNextStep}
                  onConfirmButtonClick={finish}
                />}
              </>
            ) : (
              <div className={styles.thankYouCardWrapper}>
                <ThankYouCard isAdmin={isAdmin}/>
              </div>
            )}
          </div>
        </Suspense>
      </main>
    </div>
  );
}
