import axios from "axios";

export const tikAxiosClient = axios.create({
    baseURL: "https://open.tiktokapis.com/v2/"
})