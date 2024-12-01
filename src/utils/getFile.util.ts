import { readFile } from "fs/promises"
// import { IGoogleClientSecret } from "../types/types"

export const getFile = async (path: string) => {
    let s = ""
    const stream = await readFile(path)
    const res : {web: IGoogleClientSecret}= JSON.parse(s + stream)
    return res.web
}