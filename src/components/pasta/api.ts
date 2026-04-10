import axios from 'axios'

// Atualize o host abaixo conforme o backend desejado
export const pastaApi = axios.create({
  baseURL: 'http://localhost:4000/api/pasta',
  headers: {
    'Content-Type': 'application/json'
  }
})
