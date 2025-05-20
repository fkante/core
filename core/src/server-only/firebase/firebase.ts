import { promises as fs } from "fs";
import os from "os";

import firebase from "firebase-admin";

import { Tool } from "../../definitions";

export const DCT_DEV_COLLECTION = "users_dev";
export const DCT_PROD_COLLECTION = "users_prod";
export const DEV_COLLECTION = "apple_conversion_values_dev";
export const PROD_COLLECTION = "apple_conversion_values_prod";
export const ADMIN_DASHBOARD = "adminDashboard";
export const KWARTZ_COLLECTION = "kwartz";
export const COTY_APP_CODE = "coty";
export const KLEVER_APP_CODE = "klever";
export const BATCH_NUMBER = "batchNumber";

//Contains all the tools we will be creating a document for
//Not all tools from the Tool enum will be relevant
const FIREBASE_TOOLS = [
  Tool.KROME,
  Tool.KARBON,
  Tool.AB_TEST,
  Tool.SONAR,
  Tool.KWARTZ,
  Tool.KOBALT,
];

export type ToolStatus = {
  isLive: boolean;
  lastUpdate: Date;
};
type ServiceAccountKey = { [key: string]: string };

export class KFirebase {
  private app: firebase.app.App;

  constructor(appCode: string, serviceAccountKey: ServiceAccountKey) {
    this.app = this.initializeApp(appCode, serviceAccountKey);
  }

  private initializeApp(appCode: string, serviceAccountKey: ServiceAccountKey) {
    const existingAppInstance = firebase.apps.find(
      (app) => app && app.name === appCode
    );
    if (existingAppInstance) {
      return existingAppInstance;
    }

    const newAppInstance = firebase.initializeApp(
      {
        credential: firebase.credential.cert(serviceAccountKey),
      },
      appCode
    );
    return newAppInstance;
  }

  public async getCollectionSize(collection: string) {
    if (!this.app) {
      return;
    }

    const snapshot = await firebase
      .firestore(this.app)
      .collection(collection)
      .get();
    return snapshot.size;
  }

  public async updateBatchNumber(appCode: string, batchNumber: number) {
    if (!this.app) {
      return;
    }

    const db = firebase.firestore(this.app);
    const docRef = db.collection(KWARTZ_COLLECTION).doc(BATCH_NUMBER);
    const data = (await docRef.get()).data();
    const batchNumberObject = {
      ...data,
      [appCode]: batchNumber,
    };
    docRef.set(batchNumberObject);
  }

  async getBatchNumber(appCode: string) {
    if (!this.app) {
      return;
    }
    try {
      const db = firebase.firestore(this.app);
      const query = await db
        .collection(KWARTZ_COLLECTION)
        .doc(BATCH_NUMBER)
        .get();
      if (!query) {
        return 0;
      }
      const data = query.data();
      if (!data) {
        throw new Error("No data found");
      }
      return data[appCode] || 1;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public async updateToolStatus(isLive: boolean, tool: string) {
    const db = firebase.firestore(this.app);
    const docRef = db.collection(ADMIN_DASHBOARD).doc(tool);
    const toolsStatus: ToolStatus = {
      isLive: isLive,
      lastUpdate: new Date(),
    };

    docRef.set(toolsStatus);
  }

  public async getToolsStatus() {
    try {
      const db = firebase.firestore(this.app);
      const toolsStatus: { [key: string]: ToolStatus } = {};
      for (const toolName of FIREBASE_TOOLS) {
        const query = await db.collection(ADMIN_DASHBOARD).doc(toolName).get();
        if (!query) {
          console.log("No such document!", toolName);
          return null;
        }
        //We can typecast tool as ToolStatus as we should only be retrieving ToolStatus from Firebase
        const tool = query.data() as ToolStatus;
        toolsStatus[toolName] = tool;
      }
      return toolsStatus;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public async uploadUniqueEmailsToKleverAppBundle(
    bundleId: string,
    emails: string[]
  ): Promise<number> {
    if (!this.app) {
      return 0;
    }
    const kleverFirebase = firebase.firestore(this.app);
    const studioAppsRef = kleverFirebase.collection("bundles").doc(bundleId);
    const doc = await studioAppsRef.get();
    let currentUsers: {
      user_id: string;
      sessions: { app_code: string; date: string };
    }[] = [];
    if (doc.exists) {
      currentUsers = doc.data()?.users || [];
    } else {
      await studioAppsRef.set({ users: [] });
    }

    const existingUserIds = new Set(
      currentUsers.map((user: { user_id: string }) => user.user_id)
    );
    const newUsers = emails
      .filter((email) => !existingUserIds.has(email))
      .map((email) => ({ user_id: email, sessions: [] }));
    await studioAppsRef.set(
      { users: [...currentUsers, ...newUsers] },
      { merge: true }
    );

    return newUsers.length ?? 0;
  }

  public async downloadDataForBundles(bundleIds: string[]): Promise<string> {
    if (!this.app) {
      throw new Error("Firebase app is not initialized.");
    }

    const db = firebase.firestore(this.app);
    const header = ["appCode", "date", "userId", "bundleId"];
    const rows: string[] = [header.join(",")];

    let tempFilePath: string | null = null;

    try {
      for (const bundleId of bundleIds) {
        const bundleRef = db.collection("bundles").doc(bundleId);
        const bundleDoc = await bundleRef.get();

        if (!bundleDoc.exists) {
          console.warn(`Bundle ID "${bundleId}" does not exist.`);
          continue;
        }

        const users = bundleDoc.data()?.users || [];
        for (const user of users) {
          const { user_id: userId, sessions = [] } = user;

          sessions.forEach(
            (session: {
              app_code: string;
              date: string;
              userId: string;
              bundleId: string;
            }) => {
              rows.push(
                [
                  session.app_code || "",
                  session.date || "",
                  userId || "Unknown",
                  bundleId,
                ]
                  .map((value) => `"${value}"`)
                  .join(",")
              );
            }
          );
        }
      }

      if (rows.length === 1) {
        console.log("No sessions found for the provided bundleIds.");
        return "";
      }

      const csv = rows.join("\n");

      tempFilePath = `${os.tmpdir()}/sessions-${Date.now()}.csv`;
      await fs.writeFile(tempFilePath, csv, "utf8");

      console.log(`Temporary file created at: ${tempFilePath}`);

      const fileContent = await fs.readFile(tempFilePath, "utf8");
      return fileContent;
    } catch (error) {
      console.error("Error fetching or processing sessions:", error);
      throw new Error("Failed to fetch or process sessions.");
    } finally {
      if (tempFilePath) {
        try {
          await fs.unlink(tempFilePath);
          console.log(`Temporary file deleted: ${tempFilePath}`);
        } catch (cleanupError) {
          console.error("Error cleaning up temporary file:", cleanupError);
        }
      }
    }
  }
}
