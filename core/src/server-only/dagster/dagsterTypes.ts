export interface DagsterJob {
  operationName: string;
  query: string;
  queryVariables: Record<string, string | number | object>;
}

export interface DagsterJobResponse {
  data: {
    launchRun: {
      __typename: string;
      run?: {
        runId: string;
      };
      errors?: {
        message: string;
        reason: string;
      };
    };
  };
}
