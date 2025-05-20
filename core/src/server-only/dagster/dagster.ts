import { DagsterJob, DagsterJobResponse } from "./dagsterTypes";

export class KDagster {
  private authToken: string;
  private apiURL: string;

  constructor(authToken: string, apiURL: string) {
    this.authToken = authToken;
    this.apiURL = apiURL;
  }

  async runJob(job: DagsterJob) {
    const { operationName, query, queryVariables } = job;

    const body = {
      query,
      operationName,
      variables: queryVariables,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(body),
    };

    const results = await fetch(this.apiURL, options);
    const response: DagsterJobResponse = await results.json();

    const errorMessage = response.data.launchRun.errors?.message;
    if (errorMessage) {
      console.log(
        `[Dagster] Error running job ${operationName} with error: ${errorMessage}`
      );
    }
  }
}
