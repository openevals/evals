import { Box, Heading, Select, Text, Center } from '@chakra-ui/react';
import { BasicTable } from './basicTable';
import { ITaskInstanceResponse } from '../../lib/types';

export const RunSummary = ({ evalRuns }: { evalRuns: any[] }) => (
  <Box width="100%">
    <Heading size='md' pb={4} textAlign="center">Model Runs</Heading>
    <BasicTable 
      data={evalRuns.map(run => ({
        model: run.model.modelName,
        averageScore: run.score.toFixed(2),
        status: run.status
      }))} 
      columns={[
        { header: 'Model', accessorKey: 'model' },
        { header: 'Score', accessorKey: 'averageScore' },
        { header: 'Status', accessorKey: 'status' },
      ]} 
    />
  </Box>
);

export const ResultsSummary = ({ evalRuns }: { evalRuns: any[] }) => {
  const uniqueModels = evalRuns.reduce((acc, run) => {
    if (!acc.find(item => item.model.id === run.model.id)) {
      acc.push(run);
    }
    return acc;
  }, []);

  return (
    <Box width="100%">
      <Heading size='md' pb={4} textAlign="center">Summary</Heading>
      <BasicTable 
        data={uniqueModels.map(run => ({
          model: run.model.modelName,
          numberOfRuns: evalRuns.filter(r => r.model.id === run.model.id).length,
          averageScore: (evalRuns.filter(r => r.model.id === run.model.id).reduce((sum, r) => sum + r.score, 0) / evalRuns.filter(r => r.model.id === run.model.id).length).toFixed(2),
          dateLastRan: new Date(Math.max(...evalRuns.filter(r => r.model.id === run.model.id).map(r => new Date(r.datetime).getTime()))).toLocaleDateString()
        }))} 
        columns={[
          { header: 'Model', accessorKey: 'model' },
          { header: 'Number of Runs', accessorKey: 'numberOfRuns' },
          { header: 'Average Score', accessorKey: 'averageScore' },
          { header: 'Date Last Ran', accessorKey: 'dateLastRan' },
        ]} 
      />
    </Box>
  );
};

export const ByModel = ({ evalRuns, selectedModel, setSelectedModel, taskMap }: { evalRuns: any[], selectedModel: string, setSelectedModel: (value: string) => void, taskMap: Record<number, ITaskInstanceResponse> }) => (
  <Box width="100%">
    <Heading size='md' pb={4} textAlign="center">By Model</Heading>
    <Center mb={8}>
      <Text mr={4}>Model:</Text>
      <Select
        variant='unstyled'
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        width="auto"
        fontSize="lg"
        fontWeight="bold"
      >
        {evalRuns.filter(run => !!run.model.modelName.trim()).map((run) => (
          <option key={run.model.id} value={run.model.id}>
            {run.model.modelName}
          </option>
        ))}
      </Select>
    </Center>
    {selectedModel && (
      <BasicTable 
        data={evalRuns
          .find(run => run.model.id === Number(selectedModel))
          ?.taskInstanceOutputs.map(output => ({
            input: taskMap[output.taskInstanceId]?.input || '',
            modelResponse: output.output,
            ideal: taskMap[output.taskInstanceId]?.ideal || '',
            isCorrect: output.output === taskMap[output.taskInstanceId]?.ideal ? 'Correct' : 'Incorrect'
          })) || []
        } 
        columns={[
          { header: 'Input', accessorKey: 'input' },
          { header: 'Model Response', accessorKey: 'modelResponse' },
          { header: 'Ideal', accessorKey: 'ideal' },
          { header: 'Correct?', accessorKey: 'isCorrect' },
        ]} 
      />
    )}
  </Box>
);

export const ByTaskInstance = ({ evalRuns, taskInstances, selectedTaskInstance, setSelectedTaskInstance }: { evalRuns: any[], taskInstances: ITaskInstanceResponse[], selectedTaskInstance: number | null, setSelectedTaskInstance: (value: number) => void }) => {
  const selectedTask = taskInstances.find(task => task.id === selectedTaskInstance);

  return (
    <Box width="100%">
      <Heading size='md' pb={4} textAlign="center">By Task Instance</Heading>
      <Center mb={8}>
        <Text mr={4}>Input message:</Text>
        <Select
          variant='unstyled'
          value={selectedTaskInstance || ''}
          onChange={(e) => setSelectedTaskInstance(Number(e.target.value))}
          width="auto"
          fontSize="lg"
          fontWeight="bold"
        >
          {Array.from(new Set(taskInstances.map(task => task.input))).map((input) => {
            const task = taskInstances.find(t => t.input === input);
            return (
              <option key={task?.id} value={task?.id}>
                {input.length > 50 ? `${input.substring(0, 50)}...` : input}
              </option>
            );
          })}
        </Select>
      </Center>
      {selectedTaskInstance !== null && (
        <BasicTable 
          data={[
            { model: 'Ideal response', response: selectedTask?.ideal || 'N/A', isCorrect: 'N/A' },
            ...evalRuns.map(run => {
              const output = run.taskInstanceOutputs.find(
                output => output.taskInstanceId === selectedTaskInstance
              );
              return {
                model: run.model.modelName,
                response: output ? output.output : 'N/A',
                isCorrect: output ? (output.output === selectedTask?.ideal ? 'Correct' : 'Incorrect') : 'N/A'
              };
            })
          ]}
          columns={[
            { header: 'Model', accessorKey: 'model' },
            { header: 'Response', accessorKey: 'response' },
            { header: 'Correct?', accessorKey: 'isCorrect' },
          ]} 
        />
      )}
    </Box>
  );
};