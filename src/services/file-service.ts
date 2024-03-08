import fs from 'fs';

export default class FileService {

    public loadJsonFromFile<T>(file: string): T {
        const data = fs.readFileSync(file, 'utf-8');
        const jsonData = JSON.parse(data) as T;
        return jsonData;
    }

    public saveJsonToFile<T extends object>(file: string, data: T) {
        fs.writeFileSync(file, JSON.stringify(data, null, 4));
    }
}