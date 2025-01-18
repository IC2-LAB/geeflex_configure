import request from '../utils/request';

interface SyncParams {
  path: string;
  value: any;
  type: string;
  operation?: "add" | "delete";
}

export const syncToBackend = async (params: SyncParams) => {
  const { path, value, type, operation } = params;

  try {
    const response = await request.patch("/sync/case", {
      data: {
        path,
        value,
        type,
        operation,
      },
    });

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || "Sync failed");
    }

    return response.data;
  } catch (error) {
    console.error("Failed to sync with backend:", error);
    throw error;
  }
}; 