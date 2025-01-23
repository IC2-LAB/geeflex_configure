import { API_BASE_URL } from '../config'
import axios from 'axios'

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
})

export default request

// 同步数据更新
export const syncData = async (data: {
  path: string;
  type: string;
  value: any;
  operation?: "add" | "delete";
}) => {
  try {
    const { caseId, ...bodyData } = data;
    // 构建正确的 URL
    const syncUrl = `/case/${data.caseId}/sync`;

    const response = await request.patch(syncUrl, {
      body: bodyData
    });
    return response.data;
  } catch (error) {
    console.error("Sync error:", error);
    throw error;
  }
};
