import { API_BASE_URL } from '../config'
import axios from 'axios'

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
})

export default request
