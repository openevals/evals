"use client";

import { useState, useEffect, useRef } from "react";
import {
  Button,
  useDisclosure,
  useBreakpointValue,
  useToast,
} from '@chakra-ui/react';
import { addNewEvalRuns, postNewEval } from '@/app/utils/getEvalRun';
import { defaultEvalItem, MIN_INSTANCES } from '@/app/lib/constants';
import { ModelSystem, ValidatorType, TaskInstance, IModelResponse, IEvalResponse } from '@/app/lib/types';
import usePanels from "../../lib/usePanels";
import { IRootState } from "../../lib/store";
import { useDispatch, useSelector } from "react-redux";
import { addNewEval, clearEvalToTry } from "../../lib/store/dataSlice";
import MobileEditor from './editorMobile';
import DesktopEditor from './editorDesktop';
import SubmitModal from './submitModal';
import { useRouter } from 'next/navigation';
import { useModelStorageContext } from "../../lib/providers/model-storage";

export default function Editor({ initialEval }: { initialEval?: IEvalResponse }) {
  const router = useRouter();
  const { openAIKey, anthropicKey, geminiKey } = useModelStorageContext();
  // step 1 = enter meta info
  // step 2 = add task instances
  // step 3 = run results
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validator, setValidator] = useState<ValidatorType | "">("");
  const [models, setModels] = useState<IModelResponse[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [instances, setInstances] = useState<TaskInstance[]>([]);
  const [evalObj, setEvalObj] = useState<IEvalResponse>(
    initialEval ?? defaultEvalItem,
  );
  const [evalRunIds, setEvalRunIds] = useState<number[]>([]);
  const toast = useToast();
  const isAuthenticated = useSelector<IRootState, string>(
    (state: IRootState) => state.auth.isAuthenticated,
  );
  const accessToken = useSelector<IRootState, string>(
    (state: IRootState) => state.auth.token,
  );
  const instanceInputRef = useRef<HTMLTextAreaElement>(null);
  const allModels = useSelector<IRootState, IModelResponse[]>(
    (state: IRootState) => state.data.models,
  );

  const [panel1Ref, panel2Ref, panel3Ref, panel1Collapsed, setPanel1Collapsed, panel2Collapsed, setPanel2Collapsed, panel3Collapsed, setPanel3Collapsed] = usePanels(step);
  const [tabIndex, setTabIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure(); // modal

  const evalToTryObj = useSelector<IRootState, IEvalResponse>(
    (state: IRootState) => state.data.evalToTry,
  );
  const [isTryingEval, setIsTryingEval] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isTryingEval) {
      setStep(2);
      setTabIndex(isMobile ? 3 : 2);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTryingEval]);

  /* Load the data from the model to try */
  useEffect(() => {
    if (evalToTryObj) {
      setIsTryingEval(true);
      const obj = evalToTryObj;
      setEvalObj(obj);
      dispatch(clearEvalToTry(undefined));

      setName(obj.name);
      setDescription(obj.description);
      setValidator(obj.validatorType as ValidatorType);
      setSystemPrompt(obj.taskInstances[0]?.systemPrompt ?? "");
      setInstances(obj.taskInstances);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evalToTryObj]);

  useEffect(() => {
    const newModels = allModels.map((model: IModelResponse) => {
      return { ...model, checked: model.checked ?? false };
    });
    setModels(newModels);
  }, [allModels]);

  const clickSubmitButton = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Not authorized",
        description:
          "You should authenticate with your account first to create new evaluations.",
        status: "error",
        isClosable: true,
        duration: 9000,
      });
      return;
    }

    // Error checking
    const errors: string[] = [];
    if (!name.trim()) {
      errors.push("Name is required");
    }
    if (!Object.values(ValidatorType).includes(validator as ValidatorType)) {
      errors.push("Evaluation method is required");
    }
    if (!models.some((model) => model.checked)) {
      errors.push("At least one model must be selected");
    }
    if (instances.length < 2) {
      errors.push(`At least ${MIN_INSTANCES} task instances are required`);
    }
    if (!instances.some((instance) => instance.isPublic)) {
      errors.push("At least one task instance must be marked as public");
    }

    if (errors.length > 0) {
      toast({
        title: "Oops! Please check that you've entered everything correctly:",
        description: errors.join(", "),
        status: "error",
        isClosable: true,
        duration: 9000,
      });
      return;
    }
    onOpen();
  };

  const confirmSubmit = async () => {
    onClose();
    setStep(3);
    

    const checkedModels = models.filter((model) => model.checked);
    const modelSystems: ModelSystem[] = checkedModels.map((model) => ({
      modelId: model.id,
      systemPrompt: systemPrompt,
    }));

    const newEval = isTryingEval
      ? await addNewEvalRuns(
          accessToken,
          evalObj.id,
          {
            openai: openAIKey,
            anthropic: anthropicKey,
            google: geminiKey,
          },
          modelSystems,
        )
      : await postNewEval(accessToken, {
          name,
          description,
          validatorType: validator as ValidatorType,
          modelSystems,
          taskInstances: instances,
        });
    setEvalObj(newEval);

    if (!isTryingEval) {
      dispatch(
        addNewEval({
          id: newEval.id,
          name: newEval.name,
          description: newEval.description,
          validatorType: newEval.validatorType,
        }),
      );
      setIsTryingEval(true);
    }

    // Route to the itemdetail for the new eval
    router.push(`/evals/${newEval.id}`);

    let toastMessage = isTryingEval ? "💛 Eval edited!" : "🎉 Eval created!";
    toast({
      title: toastMessage,
      description: "We are running your eval. Refresh the page to see the updated results.",
      status: "success",
      isClosable: true,
      duration: 12000,
    });    
    
    /* Show results and keep polling until eval run is finished */
    // setEvalRunIds(newEval.modelSystems.map((value: any) => value.id));
    // setTabIndex(isMobile ? 3 : 2);

  };

  const addInstance = () => {
    if (inputText !== "" && outputText !== "") {
      const newInstance: TaskInstance = {
        isPublic: false,
        input: inputText,
        ideal: outputText,
      };
      if (isTryingEval) {
        clearEvalToTryData();
        setInstances([newInstance]);
      } else {
        setInstances([...instances, newInstance]);
      }
      setInputText("");
      setOutputText("");

      // Set focus to the inputText field after adding an instance
      if (instanceInputRef.current) {
        instanceInputRef.current.focus();
      }
    } else {
      console.error("Input text and output text must not be empty");
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>,
  ) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (step === 1) {
        setStep(2);
      } else {
        addInstance();
      }
    }
  };

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  const clearEvalToTryData = () => {
    if (isTryingEval) {
      setIsTryingEval(false);
      setEvalObj(defaultEvalItem);
      setInstances([]);
    }
  };

  const changeName = (value: string) => {
    setName(value);
    clearEvalToTryData();
  };

  const changeDescription = (value: string) => {
    setDescription(value);
    clearEvalToTryData();
  };

  const changeValidator = (value: ValidatorType | "") => {
    setValidator(value);
    clearEvalToTryData();
  };

  const changeSystemPrompt = (value: string) => {
    setSystemPrompt(value);
    clearEvalToTryData();
  };

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <>
      {isMobile ? (
        <MobileEditor
          isTryingEval={isTryingEval}
          name={name}
          setName={changeName}
          description={description}
          setDescription={changeDescription}
          validator={validator}
          setValidator={changeValidator}
          models={models}
          setModels={setModels}
          systemPrompt={systemPrompt}
          setSystemPrompt={changeSystemPrompt}
          inputText={inputText}
          setInputText={setInputText}
          outputText={outputText}
          setOutputText={setOutputText}
          instances={instances}
          setInstances={setInstances}
          step={step}
          setStep={setStep}
          handleKeyDown={handleKeyDown}
          addInstance={addInstance}
          onInstancesChange={clearEvalToTryData}
          clickSubmitButton={clickSubmitButton}
          tabIndex={tabIndex}
          handleTabsChange={handleTabsChange}
          evalObj={evalObj}
          evalRunIds={evalRunIds}
          instanceInputRef={instanceInputRef}
        />
      ) : (
        <DesktopEditor
          isTryingEval={isTryingEval}
          name={name}
          setName={changeName}
          description={description}
          setDescription={changeDescription}
          validator={validator}
          setValidator={changeValidator}
          models={models}
          setModels={setModels}
          systemPrompt={systemPrompt}
          setSystemPrompt={changeSystemPrompt}
          inputText={inputText}
          setInputText={setInputText}
          outputText={outputText}
          setOutputText={setOutputText}
          instances={instances}
          setInstances={setInstances}
          step={step}
          setStep={setStep}
          panel1Collapsed={panel1Collapsed}
          setPanel1Collapsed={setPanel1Collapsed}
          panel2Collapsed={panel2Collapsed}
          setPanel2Collapsed={setPanel2Collapsed}
          panel3Collapsed={panel3Collapsed}
          setPanel3Collapsed={setPanel3Collapsed}
          handleKeyDown={handleKeyDown}
          panel1Ref={panel1Ref}
          panel2Ref={panel2Ref}
          panel3Ref={panel3Ref}
          addInstance={addInstance}
          onInstancesChange={clearEvalToTryData}
          clickSubmitButton={clickSubmitButton}
          tabIndex={tabIndex}
          handleTabsChange={handleTabsChange}
          evalObj={evalObj}
          evalRunIds={evalRunIds}
          instanceInputRef={instanceInputRef}
        />
      )}
      <SubmitModal isOpen={isOpen} onClose={onClose} onConfirm={confirmSubmit} />
    </>
  );
}
